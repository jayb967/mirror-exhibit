import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase-server';
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

    // Create a Supabase client
    const supabase = await createServerSupabaseClient();

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

        // Retrieve the order ID from metadata
        const orderId = session.client_reference_id;

        if (!orderId) {
          console.error('No order ID found in session');
          return NextResponse.json({ error: 'No order ID found' }, { status: 400 });
        }

        // Get order details for notifications
        const { data: order } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        // Update order status using tracking service
        await orderTrackingService.updateOrderStatus({
          orderId,
          newStatus: 'paid',
          changeReason: 'Payment completed via Stripe',
          metadata: {
            stripe_session_id: session.id,
            payment_intent_id: session.payment_intent as string
          }
        });

        // Create payment intent record
        if (session.payment_intent) {
          await supabase
            .from('stripe_payment_intents')
            .upsert({
              order_id: orderId,
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
        if (order) {
          await notificationService.createNotification({
            type: 'admin_new_order',
            title: 'New Order Received',
            message: `New order #${orderId.substring(0, 8)} for $${((session.amount_total || 0) / 100).toFixed(2)}`,
            actionUrl: `/admin/orders/${orderId}`,
            data: {
              order_id: orderId,
              amount: session.amount_total,
              customer_email: session.customer_details?.email
            }
          }, {
            adminOnly: true,
            sendEmail: true,
            emailTemplate: 'admin_new_order',
            emailData: {
              order_number: orderId.substring(0, 8),
              customer_name: order.shipping_address?.first_name || 'Customer',
              customer_email: session.customer_details?.email || order.guest_email,
              order_date: new Date().toLocaleDateString(),
              total_amount: ((session.amount_total || 0) / 100).toFixed(2),
              payment_status: 'paid',
              admin_order_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderId}`
            }
          });
        }

        console.log(`Payment for order ${orderId} succeeded!`);
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