'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';
import StaticNavigation from '@/components/admin/StaticNavigation';

// Simple static admin dashboard with no server components
export default function StaticAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  // Only render after component has mounted on the client
  useEffect(() => {
    setMounted(true);

    // Fetch data after mounting
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();

        // Fetch products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) throw productsError;

        // Fetch orders count
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        if (ordersError) throw ordersError;

        // Set stats
        setStats({
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue: 1000, // Placeholder
          lowStockProducts: 5, // Placeholder
        });

        // Set placeholder orders
        setRecentOrders([
          { id: '1', created_at: new Date().toISOString(), total: 100, status: 'completed', user_name: 'John Doe' },
          { id: '2', created_at: new Date().toISOString(), total: 200, status: 'processing', user_name: 'Jane Smith' },
        ]);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Simple stats card component
  const StatsCard = ({ title, value, color }) => (
    <div className="tw-bg-white tw-shadow-md tw-p-6 tw-border-l-4" style={{ borderColor: color }}>
      <div className="tw-flex tw-items-center tw-justify-between">
        <div>
          <h3 className="tw-text-lg tw-font-medium tw-text-gray-500">{title}</h3>
          <p className="tw-text-2xl tw-font-bold tw-mt-1">{value}</p>
        </div>
      </div>
    </div>
  );

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const pathname = usePathname();

  return (
    <div className="tw-min-h-screen tw-bg-[#F8F8F8]">
      <ToastContainer />

      {/* Navigation */}
      <StaticNavigation currentPath={pathname} />

      {/* Main content */}
      <div className="tw-md:ml-64 tw-p-4 tw-pt-8">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Dashboard</h1>

        {loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-mb-8">
              <StatsCard
                title="Total Products"
                value={stats.totalProducts}
                color="#000000"
              />
              <StatsCard
                title="Low Stock Products"
                value={stats.lowStockProducts}
                color="#A6A182"
              />
              <StatsCard
                title="Total Orders"
                value={stats.totalOrders}
                color="#000000"
              />
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                color="#A6A182"
              />
            </div>

            <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
              <div className="tw-bg-white tw-shadow-md tw-p-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Recent Orders</h2>
                {recentOrders.length === 0 ? (
                  <p className="tw-text-gray-500 tw-text-center tw-py-4">No orders yet</p>
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
                            Customer
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
                              {order.id}
                            </td>
                            <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                              {order.user_name}
                            </td>
                            <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                              <span className={`tw-px-2 tw-inline-flex tw-text-xs tw-leading-5 tw-font-semibold ${
                                order.status === 'completed'
                                  ? 'tw-bg-green-100 tw-text-green-800'
                                  : order.status === 'processing'
                                  ? 'tw-bg-[#A6A182] tw-text-white'
                                  : 'tw-bg-gray-100 tw-text-gray-800'
                              }`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="tw-bg-white tw-shadow-md tw-p-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Quick Links</h2>
                <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
                  <a
                    href="/admin/products"
                    className="tw-flex tw-items-center tw-p-4 tw-bg-gray-50 hover:tw-bg-[#A6A182] hover:tw-text-white tw-transition-colors"
                  >
                    <span className="tw-ml-3 tw-font-medium">Products</span>
                  </a>

                  <a
                    href="/admin/orders"
                    className="tw-flex tw-items-center tw-p-4 tw-bg-gray-50 hover:tw-bg-[#A6A182] hover:tw-text-white tw-transition-colors"
                  >
                    <span className="tw-ml-3 tw-font-medium">Orders</span>
                  </a>

                  <a
                    href="/admin/users"
                    className="tw-flex tw-items-center tw-p-4 tw-bg-gray-50 hover:tw-bg-[#A6A182] hover:tw-text-white tw-transition-colors"
                  >
                    <span className="tw-ml-3 tw-font-medium">Users</span>
                  </a>

                  <a
                    href="/admin/settings"
                    className="tw-flex tw-items-center tw-p-4 tw-bg-gray-50 hover:tw-bg-[#A6A182] hover:tw-text-white tw-transition-colors"
                  >
                    <span className="tw-ml-3 tw-font-medium">Settings</span>
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
