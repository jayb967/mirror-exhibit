'use client';


// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useSupabaseClient } from '@/utils/supabase-client';
import BasicAdminLayout from "@/components/admin/BasicAdminLayout";

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  borderColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, borderColor }) => (
  <div className="tw-bg-white tw-p-6 tw-border tw-border-l-4 tw-shadow-sm" style={{ borderLeftColor: borderColor }}>
    <h3 className="tw-text-lg tw-font-medium tw-text-gray-800">{title}</h3>
    <p className="tw-text-3xl tw-font-bold tw-mt-2">{value}</p>
  </div>
);

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export default function Dashboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function fetchData() {
      try {

        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) console.error('Error fetching products:', productsError);

        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        if (ordersError) console.error('Error fetching orders:', ordersError);

        // Fetch recent orders
        const { data: orders, error: recentOrdersError } = await supabase
          .from('orders')
          .select('id, created_at, total, status, user_id')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentOrdersError) console.error('Error fetching recent orders:', recentOrdersError);

        // Set stats
        setStats({
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue: 12500, // Placeholder for now
          lowStockProducts: 3, // Placeholder for now
        });

        // Set recent orders
        setRecentOrders(orders || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const content = loading ? (
    <div className="tw-bg-white tw-p-6 tw-shadow-sm">
      <h1 className="tw-text-2xl tw-font-bold tw-mb-6">Dashboard</h1>
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="tw-bg-gray-100 tw-animate-pulse tw-h-32"></div>
        ))}
      </div>
      <div className="tw-mt-8">
        <h2 className="tw-text-xl tw-font-bold tw-mb-4">Recent Orders</h2>
        <div className="tw-bg-gray-50 tw-p-4 tw-border tw-border-gray-200">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="tw-py-3 tw-animate-pulse">
              <div className="tw-h-4 tw-bg-gray-200 tw-w-3/4 tw-mb-2"></div>
              <div className="tw-h-3 tw-bg-gray-200 tw-w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="tw-bg-white tw-p-6 tw-shadow-sm">
      <h1 className="tw-text-2xl tw-font-bold tw-mb-6">Dashboard</h1>

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          borderColor="#A6A182"
        />

        <StatsCard
          title="Low Stock Products"
          value={stats.lowStockProducts}
          borderColor="#000000"
        />

        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          borderColor="#A6A182"
        />

        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          borderColor="#000000"
        />
      </div>

      <div className="tw-mt-8">
        <h2 className="tw-text-xl tw-font-bold tw-mb-4">Recent Orders</h2>
        <div className="tw-bg-gray-50 tw-p-4 tw-border tw-border-gray-200">
          {recentOrders.length === 0 ? (
            <p className="tw-text-gray-500 tw-text-center tw-py-4">No recent orders</p>
          ) : (
            <div className="tw-overflow-x-auto">
              <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Order ID
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Date
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Amount
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900">
                        #{order.id.toString().padStart(5, '0')}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {formatCurrency(order.total || 0)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <span className={`tw-px-2 tw-inline-flex tw-text-xs tw-leading-5 tw-font-semibold ${
                          order.status === 'completed'
                            ? 'tw-bg-green-100 tw-text-green-800'
                            : order.status === 'processing'
                            ? 'tw-bg-[#A6A182] tw-text-white'
                            : 'tw-bg-gray-100 tw-text-gray-800'
                        }`}>
                          {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1)) : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="tw-mt-8">
        <h2 className="tw-text-xl tw-font-bold tw-mb-4">Quick Links</h2>
        <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4">
          <a
            href="/admin/products"
            className="tw-flex tw-items-center tw-p-4 tw-bg-gray-50 hover:tw-bg-[#A6A182] hover:tw-text-white tw-transition-colors"
          >
            <span className="tw-font-medium">Manage Products</span>
          </a>

          <a
            href="/admin/orders"
            className="tw-flex tw-items-center tw-p-4 tw-bg-gray-50 hover:tw-bg-[#A6A182] hover:tw-text-white tw-transition-colors"
          >
            <span className="tw-font-medium">View Orders</span>
          </a>

          <a
            href="/admin/users"
            className="tw-flex tw-items-center tw-p-4 tw-bg-gray-50 hover:tw-bg-[#A6A182] hover:tw-text-white tw-transition-colors"
          >
            <span className="tw-font-medium">Manage Users</span>
          </a>

          <a
            href="/admin/coupons"
            className="tw-flex tw-items-center tw-p-4 tw-bg-gray-50 hover:tw-bg-[#A6A182] hover:tw-text-white tw-transition-colors"
          >
            <span className="tw-font-medium">Manage Coupons</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <BasicAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        {content}
      </div>
    </BasicAdminLayout>
  );
}
