import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

/**
 * GET /api/dashboard/orders/[id]
 * Get detailed order information for the authenticated user
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServerSupabaseClient();

    // Get order details
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

    // Get tracking events
    const { data: trackingEvents } = await supabase
      .from('shipping_tracking_events')
      .select('*')
      .eq('order_id', params.id)
      .order('event_timestamp', { ascending: false });

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
      trackingEvents: trackingEvents || [],
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
