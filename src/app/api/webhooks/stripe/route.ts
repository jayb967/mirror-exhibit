// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { orderTrackingService } from '@/services/orderTrackingService';
import { notificationService } from '@/services/notificationService';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// This is your Stripe CLI webhook secret for testing your endpoint locally
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
    }

    // Create a Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Log webhook event for debugging
    await supabase
      .from('stripe_webhooks')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        event_data: event.data,
        processed: false
      })
      .catch(err => console.error('Failed to log webhook:', err));

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // NEW FLOW: Update existing order with additional payment details
        console.log('Webhook processing session:', session.id);

        // Check if order already exists (should exist from immediate creation)
        const { data: existingOrder, error: orderError } = await supabase
          .from('orders')
          .select('id, status')
          .eq('stripe_session_id', session.id)
          .single();

        if (orderError || !existingOrder) {
          console.log('No existing order found, webhook will skip processing for session:', session.id);
          // This is fine - order was created immediately after payment
          return NextResponse.json({ message: 'Order already processed' });
        }

        try {
          // Update order with additional payment information from webhook
          const updateData = {
            stripe_payment_intent_id: session.payment_intent,
            payment_status: 'completed',
            webhook_processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', existingOrder.id);

          if (updateError) {
            console.error('Error updating order with webhook data:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
          }

          console.log('Order updated successfully with webhook data:', existingOrder.id);

          // Clean up the pending order if it still exists
          await supabase
            .from('pending_orders')
            .delete()
            .eq('stripe_session_id', session.id);

          // Create payment intent record
          if (session.payment_intent) {
            await supabase
              .from('stripe_payment_intents')
              .upsert({
                order_id: order.id,
                stripe_payment_intent_id: session.payment_intent as string,
                stripe_customer_id: session.customer as string,
                amount_cents: session.amount_total || 0,
                currency: session.currency || 'usd',
                status: 'succeeded',
                payment_method_type: session.payment_method_types?.[0] || 'card',
                metadata: session.metadata
              });
          }

          // Send admin notification for new order
          await notificationService.createNotification({
            type: 'admin_new_order',
            title: 'New Order Received',
            message: `New order #${order.id.substring(0, 8)} for $${((session.amount_total || 0) / 100).toFixed(2)}`,
            actionUrl: `/admin/orders/${order.id}`,
            data: {
              order_id: order.id,
              amount: session.amount_total,
              customer_email: session.customer_details?.email
            }
          }, {
            adminOnly: true,
            sendEmail: true,
            emailTemplate: 'admin_new_order',
            emailData: {
              order_number: order.id.substring(0, 8),
              customer_name: order.shipping_address?.first_name || 'Customer',
              customer_email: session.customer_details?.email || order.guest_email,
              order_date: new Date().toLocaleDateString(),
              total_amount: ((session.amount_total || 0) / 100).toFixed(2),
              payment_status: 'paid',
              admin_order_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.id}`
            }
          });

          console.log(`Payment for order ${order.id} succeeded!`);

        } catch (parseError) {
          console.error('Error parsing order data from metadata:', parseError);
          return NextResponse.json({ error: 'Invalid order data in metadata' }, { status: 400 });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Get order ID from metadata
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          // Update order status if not already updated
          const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

          if (!fetchError && order && order.status !== 'paid') {
            await supabase
              .from('orders')
              .update({
                status: 'paid',
                payment_intent_id: paymentIntent.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId);
          }
        }

        console.log(`PaymentIntent ${paymentIntent.id} succeeded!`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Get order ID from metadata
        const orderId = paymentIntent.metadata?.order_id;

        if (orderId) {
          // Update order status using tracking service
          await orderTrackingService.updateOrderStatus({
            orderId,
            newStatus: 'failed',
            changeReason: 'Payment failed',
            metadata: {
              payment_intent_id: paymentIntent.id,
              failure_reason: paymentIntent.last_payment_error?.message
            }
          });
        }

        console.log(`Payment failed for intent ${paymentIntent.id}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          // Find the order associated with this payment intent
          const { data: order, error } = await supabase
            .from('orders')
            .select('id')
            .eq('payment_intent_id', paymentIntentId)
            .single();

          if (!error && order) {
            // Update order status using tracking service
            await orderTrackingService.updateOrderStatus({
              orderId: order.id,
              newStatus: 'refunded',
              changeReason: 'Charge refunded via Stripe',
              metadata: {
                charge_id: charge.id,
                refund_amount: charge.amount_refunded,
                refund_reason: charge.refunds?.data?.[0]?.reason
              }
            });

            console.log(`Order ${order.id} has been refunded`);
          }
        }

        break;
      }

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }

    // Mark webhook as processed
    await supabase
      .from('stripe_webhooks')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id)
      .catch(err => console.error('Failed to mark webhook as processed:', err));

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}