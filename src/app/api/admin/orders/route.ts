// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * API endpoint to get orders for admin users
 * This bypasses RLS policies using the service role key
 *
 * SECURITY: This endpoint is protected by middleware - only authenticated admin users
 * can access /admin/* routes. No additional auth verification needed here.
 */
export async function GET(request: NextRequest) {
  try {
    // NOTE: This endpoint is protected by middleware (/admin routes require authentication)
    // Using service role for database access since this is an admin-only endpoint
    console.log('Admin orders API: Processing request for admin orders');

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const statusFilter = url.searchParams.get('status') || '';

    // Use admin client to bypass RLS
    const adminClient = getAdminClient();

    // Build the query - no profiles join since we're using Clerk
    let query = adminClient
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          price,
          unit_price,
          total_price,
          product_name,
          size_name,
          frame_name,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Apply status filter if selected
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let totalCount = 0;
    let countQuery = adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Apply the same status filter for count
    if (statusFilter) {
      countQuery = countQuery.eq('status', statusFilter);
    }

    const { count: countResult, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting order count:', countError);
      // Don't fail the request if count fails, just use 0
    } else {
      totalCount = countResult || 0;
    }

    // Process orders to include customer info (Clerk users vs guests)
    const processedOrders = data?.map(order => {
      let customerInfo = {
        name: 'Unknown Customer',
        email: 'unknown@example.com',
        type: 'unknown'
      };

      if (order.user_id) {
        // Clerk authenticated user
        customerInfo = {
          name: `Clerk User (${order.user_id.slice(-8)})`,
          email: order.customer_email || order.billing_email || 'clerk-user@example.com',
          type: 'clerk'
        };
      } else if (order.guest_email) {
        // Guest user
        customerInfo = {
          name: `${order.first_name || 'Guest'} ${order.last_name || 'User'}`.trim(),
          email: order.guest_email,
          type: 'guest'
        };
      } else if (order.customer_email) {
        // Fallback to customer email
        customerInfo = {
          name: order.customer_email.split('@')[0],
          email: order.customer_email,
          type: 'customer'
        };
      }

      return {
        ...order,
        customer_info: customerInfo,
        user_name: customerInfo.name, // For backward compatibility
        customer_email: customerInfo.email // For backward compatibility
      };
    }) || [];

    return NextResponse.json({
      orders: processedOrders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });

  } catch (error) {
    console.error('Error in admin orders API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to update order status for admin users
 *
 * SECURITY: This endpoint is protected by middleware - only authenticated admin users
 * can access /admin/* routes. No additional auth verification needed here.
 */
export async function PATCH(request: NextRequest) {
  try {
    // NOTE: This endpoint is protected by middleware (/admin routes require authentication)
    // Using service role for database access since this is an admin-only endpoint
    console.log('Admin orders API: Processing order status update');

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid order status' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const adminClient = getAdminClient();

    const { data, error } = await adminClient
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: data
    });

  } catch (error) {
    console.error('Error in admin order update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
