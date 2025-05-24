// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAccess } from '@/utils/admin-auth';

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
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access using centralized utility
    const authResult = await verifyAdminAccess({
      operation: 'view orders'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const statusFilter = url.searchParams.get('status') || '';

    // Use admin client to bypass RLS
    const adminClient = getAdminClient();

    // Build the query
    let query = adminClient
      .from('orders')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
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

    // Process orders to include user name
    const processedOrders = data?.map(order => ({
      ...order,
      user_name: order.profiles
        ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || 'Anonymous'
        : 'Anonymous'
    })) || [];

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
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin access using centralized utility
    const authResult = await verifyAdminAccess({
      operation: 'update order status'
    });

    if (!authResult.success) {
      return authResult.error;
    }

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
