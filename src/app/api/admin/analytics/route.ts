import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/utils/admin-auth';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data for admin dashboard
 */
export async function GET(req: Request) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess({
      operation: 'fetch analytics data'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '30_days';

    const supabase = await createServerSupabaseClient();

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (timeRange) {
      case '7_days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90_days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1_year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Get current period data
    const { data: currentOrders } = await supabase
      .from('orders')
      .select('total_amount, created_at, status, user_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());

    // Get previous period data for comparison
    const { data: previousOrders } = await supabase
      .from('orders')
      .select('total_amount, created_at, status, user_id')
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // Calculate overview metrics
    const currentRevenue = currentOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const currentOrderCount = currentOrders?.length || 0;
    const previousOrderCount = previousOrders?.length || 0;
    const orderGrowth = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;

    // Get unique customers
    const currentCustomers = new Set(currentOrders?.map(order => order.user_id) || []).size;
    const previousCustomers = new Set(previousOrders?.map(order => order.user_id) || []).size;
    const customerGrowth = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;

    const averageOrderValue = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;

    // Get orders by status
    const ordersByStatus = currentOrders?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get recent orders with customer info
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        status,
        shipping_address
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    // Format recent orders with customer names
    const formattedRecentOrders = recentOrders?.map(order => ({
      ...order,
      customer_name: order.shipping_address?.first_name && order.shipping_address?.last_name
        ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
        : 'Unknown Customer'
    })) || [];

    // Get top products
    const { data: topProductsData } = await supabase
      .from('order_items')
      .select(`
        product_name,
        quantity,
        unit_price,
        orders!inner(created_at)
      `)
      .gte('orders.created_at', startDate.toISOString())
      .lte('orders.created_at', now.toISOString());

    // Aggregate top products
    const productStats = topProductsData?.reduce((acc, item) => {
      const productName = item.product_name;
      if (!acc[productName]) {
        acc[productName] = {
          product_name: productName,
          total_sold: 0,
          revenue: 0
        };
      }
      acc[productName].total_sold += item.quantity;
      acc[productName].revenue += item.quantity * item.unit_price;
      return acc;
    }, {} as Record<string, any>) || {};

    const topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    // Get revenue by month (for chart data)
    const { data: monthlyData } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Group by month
    const revenueByMonth = monthlyData?.reduce((acc, order) => {
      const month = new Date(order.created_at).toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, revenue: 0, orders: 0 };
      }
      acc[month].revenue += order.total_amount || 0;
      acc[month].orders += 1;
      return acc;
    }, {} as Record<string, any>) || {};

    const revenueByMonthArray = Object.values(revenueByMonth)
      .sort((a: any, b: any) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // Get total customers count
    const { count: totalCustomers } = await supabase
      .from('orders')
      .select('user_id', { count: 'exact', head: true })
      .not('user_id', 'is', null);

    const analyticsData = {
      overview: {
        totalRevenue: currentRevenue,
        totalOrders: currentOrderCount,
        totalCustomers: totalCustomers || 0,
        averageOrderValue,
        revenueGrowth,
        orderGrowth,
        customerGrowth
      },
      recentOrders: formattedRecentOrders,
      topProducts,
      ordersByStatus,
      revenueByMonth: revenueByMonthArray
    };

    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
