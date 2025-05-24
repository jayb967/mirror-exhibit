import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Get orders for a guest user
 * This endpoint allows guest users to view their orders using their email and order ID
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    const orderId = url.searchParams.get('orderId');
    const guestToken = url.searchParams.get('token');
    
    // Validate request - require either email+orderId or guestToken
    if ((!email || !orderId) && !guestToken) {
      return NextResponse.json(
        { error: 'Email and order ID are required, or a valid guest token' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          id,
          product_id,
          quantity,
          price,
          product:products(
            id,
            name,
            image_url
          )
        ),
        shipping_address:shipping_addresses(*)
      `);
    
    // Filter by guest token or email+orderId
    if (guestToken) {
      query = query.eq('guest_token', guestToken);
    } else {
      query = query
        .eq('guest_email', email)
        .eq('id', orderId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching guest orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }
    
    // If no orders found
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No orders found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ orders: data });
  } catch (error) {
    console.error('Guest orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get a specific order for a guest user
 * This endpoint allows guest users to view a specific order using the order ID and email
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, orderId } = body;
    
    // Validate request
    if (!email || !orderId) {
      return NextResponse.json(
        { error: 'Email and order ID are required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get order with order items and shipping address
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          id,
          product_id,
          quantity,
          price,
          product:products(
            id,
            name,
            image_url
          )
        ),
        shipping_address:shipping_addresses(*)
      `)
      .eq('guest_email', email)
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('Error fetching guest order:', error);
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      );
    }
    
    // If no order found
    if (!data) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ order: data });
  } catch (error) {
    console.error('Guest order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
