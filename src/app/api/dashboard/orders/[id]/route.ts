// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/utils/clerk-supabase';

/**
 * GET /api/dashboard/orders/[id]
 * Get detailed order information for the authenticated user
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminSupabaseClient();

    // Get order details with shipping address from separate table
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        subtotal,
        tax_amount,
        tax_rate,
        tax_description,
        shipping_cost,
        discount_amount,
        total_amount,
        currency,
        shipping_address,
        shipping_method,
        shipping_carrier,
        payment_method,
        payment_intent_id,
        stripe_session_id,
        tracking_number,
        tracking_url,
        shipping_label_url,
        courier_id,
        courier_name,
        estimated_delivery_date,
        actual_delivery_date,
        notes,
        confirmed_at,
        shipped_at,
        delivered_at,
        order_items:order_items(
          id,
          product_id,
          product_variation_id,
          product_name,
          product_description,
          size_name,
          frame_type,
          sku,
          quantity,
          unit_price,
          total_price,
          stripe_product_id,
          stripe_price_id
        )
      `)
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get shipping address from separate table if not stored as JSON
    if (!order.shipping_address) {
      const { data: shippingAddress } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('order_id', params.id)
        .single();

      if (shippingAddress) {
        order.shipping_address = {
          first_name: shippingAddress.first_name,
          last_name: shippingAddress.last_name,
          company: shippingAddress.company,
          address_line_1: shippingAddress.address_line_1,
          address_line_2: shippingAddress.address_line_2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country,
          phone: shippingAddress.phone
        };
      }
    }

    // Tracking events are not needed - tracking info is already in the order

    // Get status history
    const { data: statusHistory } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', params.id)
      .order('created_at', { ascending: false });

    // Get customer-visible order notes
    const { data: orderNotes } = await supabase
      .from('order_notes')
      .select('*')
      .eq('order_id', params.id)
      .eq('is_customer_visible', true)
      .order('created_at', { ascending: false });

    // Get payment details if available
    const { data: paymentIntent } = await supabase
      .from('stripe_payment_intents')
      .select('*')
      .eq('order_id', params.id)
      .single();

    return NextResponse.json({
      order,
      statusHistory: statusHistory || [],
      orderNotes: orderNotes || [],
      paymentIntent
    });
  } catch (error: any) {
    console.error('Dashboard order details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
