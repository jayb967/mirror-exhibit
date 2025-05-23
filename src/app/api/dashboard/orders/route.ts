import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

/**
 * GET /api/dashboard/orders
 * Get orders for the authenticated user with pagination and filtering
 */
export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    const supabase = await createServerSupabaseClient();

    // Build the query
    let query = supabase
      .from('orders')
      .select(`
        id,
        created_at,
        updated_at,
        status,
        subtotal,
        tax_amount,
        shipping_cost,
        discount_amount,
        total_amount,
        currency,
        tracking_number,
        tracking_url,
        courier_name,
        estimated_delivery_date,
        actual_delivery_date,
        shipped_at,
        delivered_at,
        notes,
        order_items:order_items(
          id,
          product_name,
          size_name,
          frame_type,
          quantity,
          unit_price,
          total_price,
          sku
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      // Search in order ID or product names
      query = query.or(`id.ilike.%${search}%,order_items.product_name.ilike.%${search}%`);
    }

    // Apply pagination
    const { data: orders, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const allOrdersQuery = await supabase
      .from('orders')
      .select('status, total_amount')
      .eq('user_id', userId);

    const allOrders = allOrdersQuery.data || [];
    const summary = {
      totalOrders: allOrders.length,
      totalSpent: allOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      ordersByStatus: allOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      summary,
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error: any) {
    console.error('Dashboard orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
