import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Helper function to validate order
async function validateOrder(supabase: any, orderId: string, userId: string | null, guestToken: string | null) {
  if (userId) {
    // Validate order for authenticated user
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    return { order, error };
  } else if (guestToken) {
    // Validate order for guest user
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('guest_token', guestToken)
      .single();

    return { order, error };
  }

  return { order: null, error: new Error('No user ID or guest token provided') };
}

export async function POST(req: Request) {
  try {
    // Get the request body
    const body = await req.json();
    const { items, orderId, shipping, tax, customer, guestToken } = body;

    // Create a Supabase client
    const supabase = await createServerSupabaseClient();

    // Check if user is authenticated
    const { data: { session: userSession } } = await supabase.auth.getSession();
    const userId = userSession?.user?.id || null;

    // Validate order exists and belongs to user or guest
    const { order, error } = await validateOrder(supabase, orderId, userId, guestToken);

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Format line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            product_id: item.id
          }
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add shipping and tax as separate line items
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            metadata: {
              type: 'shipping'
            }
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
            metadata: {
              type: 'tax'
            }
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    // Generate website URL for success and cancel
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Create a checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: customer.email,
      client_reference_id: orderId,
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order/canceled?order_id=${orderId}`,
      metadata: {
        order_id: orderId,
        user_id: userId || '',
        guest_token: guestToken || ''
      },
      payment_intent_data: {
        metadata: {
          order_id: orderId,
          user_id: userId || '',
          guest_token: guestToken || ''
        }
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500,
              currency: 'usd',
            },
            display_name: 'Express Shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 2,
              },
            },
          },
        },
      ],
    });

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({
        stripe_session_id: stripeSession.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}