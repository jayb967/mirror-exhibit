import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
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
    const supabase = createRouteHandlerClient({ cookies });

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
        
        // Update order status in the database
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_intent_id: session.payment_intent as string,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);
          
        if (error) {
          console.error('Error updating order status:', error);
          return NextResponse.json({ error: 'Error updating order' }, { status: 500 });
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
          // Update order status to failed
          await supabase
            .from('orders')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);
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
            // Update order status to refunded
            await supabase
              .from('orders')
              .update({
                status: 'refunded',
                updated_at: new Date().toISOString()
              })
              .eq('id', order.id);
              
            console.log(`Order ${order.id} has been refunded`);
          }
        }
        
        break;
      }
      
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 