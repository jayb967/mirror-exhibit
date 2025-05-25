// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    // Get the request body
    const body = await req.json();
    const { items, orderData, shipping, tax, customer, guestToken, discount } = body;

    // Create Supabase client with service role key
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

    // Get user ID from orderData if available (for metadata)
    const userId = orderData?.user_id || null;

    // Helper function to validate URL
    const isValidUrl = (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // Format line items for Stripe
    const lineItems = items.map((item: any) => {
      const price = parseFloat(item.price) || 0;
      const unitAmount = Math.max(1, Math.round(price * 100)); // Ensure positive integer, minimum 1 cent

      // Validate and filter images
      const images: string[] = [];
      if (item.image && typeof item.image === 'string' && isValidUrl(item.image)) {
        images.push(item.image);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || 'Product',
            images, // Only include valid URLs
            metadata: {
              product_id: item.id
            }
          },
          unit_amount: unitAmount,
        },
        quantity: Math.max(1, parseInt(item.quantity) || 1), // Ensure positive quantity
      };
    });

    // Add shipping and tax as separate line items
    const shippingAmount = parseFloat(shipping) || 0;
    if (shippingAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            metadata: {
              type: 'shipping'
            }
          },
          unit_amount: Math.max(1, Math.round(shippingAmount * 100)),
        },
        quantity: 1,
      });
    }

    const taxAmount = parseFloat(tax) || 0;
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
            metadata: {
              type: 'tax'
            }
          },
          unit_amount: Math.max(1, Math.round(taxAmount * 100)),
        },
        quantity: 1,
      });
    }

    // Note: Discounts are handled in the order total calculation, not as negative line items
    // Stripe doesn't allow negative unit_amount values

    // Debug: Log line items to help identify issues
    console.log('Original items:', items.map(item => ({
      name: item.name,
      image: item.image,
      price: item.price
    })));
    console.log('Processed line items for Stripe:', JSON.stringify(lineItems, null, 2));

    // Generate website URL for success and cancel
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Create a checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: customer.email,
      payment_method_types: ['card'], // Only card is supported for checkout sessions
      billing_address_collection: 'required',
      // Shipping address is collected on our checkout page, not in Stripe
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        user_id: userId || '',
        guest_token: guestToken || '',
        order_type: 'ecommerce'
      },
      payment_intent_data: {
        metadata: {
          user_id: userId || '',
          guest_token: guestToken || '',
          order_type: 'ecommerce'
        }
      },
      // Shipping is handled on our checkout page, not in Stripe
    });

    // Store order data in pending_orders table (avoids Stripe metadata size limit)
    const { error: pendingOrderError } = await supabase
      .from('pending_orders')
      .insert({
        stripe_session_id: stripeSession.id,
        order_data: orderData,
        items_data: items
      });

    if (pendingOrderError) {
      console.error('Error storing pending order:', pendingOrderError);
      // Don't fail the checkout, but log the error
    }

    return NextResponse.json({
      url: stripeSession.url,
      sessionId: stripeSession.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}