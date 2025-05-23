'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useClerkAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ShoppingBagIcon,
  BellIcon,
  TruckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  unreadNotifications: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_items: Array<{
    product_name: string;
    quantity: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    unreadNotifications: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user orders
      const ordersResponse = await fetch('/api/dashboard/orders?limit=5');
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);

        // Calculate stats from orders
        const allOrdersResponse = await fetch('/api/dashboard/orders?limit=1000');
        if (allOrdersResponse.ok) {
          const allOrdersData = await allOrdersResponse.json();
          const orders = allOrdersData.orders || [];

          setStats({
            totalOrders: orders.length,
            pendingOrders: orders.filter((o: any) => ['pending', 'confirmed', 'paid'].includes(o.status)).length,
            shippedOrders: orders.filter((o: any) => ['shipped', 'out_for_delivery'].includes(o.status)).length,
            deliveredOrders: orders.filter((o: any) => o.status === 'delivered').length,
            unreadNotifications: 0 // Will be updated when we fetch notifications
          });
        }
      }

      // Fetch notifications count
      const notificationsResponse = await fetch('/api/notifications?unread_only=true&limit=1');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setStats(prev => ({
          ...prev,
          unreadNotifications: notificationsData.unreadCount || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'tw-text-yellow-600 tw-bg-yellow-100';
      case 'paid':
      case 'processing':
        return 'tw-text-gray-700 tw-bg-gray-100';
      case 'shipped':
      case 'out_for_delivery':
        return 'tw-text-gray-800 tw-bg-gray-200';
      case 'delivered':
        return 'tw-text-green-600 tw-bg-green-100';
      case 'canceled':
      case 'refunded':
        return 'tw-text-red-600 tw-bg-red-100';
      default:
        return 'tw-text-gray-600 tw-bg-gray-100';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2" style={{ borderColor: '#A6A182' }}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="tw-space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">
            Welcome back, {user?.full_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
            Here's what's happening with your orders and account.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
          <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
            <div className="tw-p-5">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0">
                  <ShoppingBagIcon className="tw-h-6 tw-w-6 tw-text-gray-400" />
                </div>
                <div className="tw-ml-5 tw-w-0 tw-flex-1">
                  <dl>
                    <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                      Total Orders
                    </dt>
                    <dd className="tw-text-lg tw-font-medium tw-text-gray-900">
                      {stats.totalOrders}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
            <div className="tw-p-5">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0">
                  <TruckIcon className="tw-h-6 tw-w-6" style={{ color: '#A6A182' }} />
                </div>
                <div className="tw-ml-5 tw-w-0 tw-flex-1">
                  <dl>
                    <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                      In Progress
                    </dt>
                    <dd className="tw-text-lg tw-font-medium tw-text-gray-900">
                      {stats.pendingOrders + stats.shippedOrders}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
            <div className="tw-p-5">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0">
                  <CheckCircleIcon className="tw-h-6 tw-w-6 tw-text-green-400" />
                </div>
                <div className="tw-ml-5 tw-w-0 tw-flex-1">
                  <dl>
                    <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                      Delivered
                    </dt>
                    <dd className="tw-text-lg tw-font-medium tw-text-gray-900">
                      {stats.deliveredOrders}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
            <div className="tw-p-5">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0">
                  <BellIcon className="tw-h-6 tw-w-6" style={{ color: '#A6A182' }} />
                </div>
                <div className="tw-ml-5 tw-w-0 tw-flex-1">
                  <dl>
                    <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                      Notifications
                    </dt>
                    <dd className="tw-text-lg tw-font-medium tw-text-gray-900">
                      {stats.unreadNotifications}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg">
          <div className="tw-px-4 tw-py-5 sm:tw-p-6">
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
              <h3 className="tw-text-lg tw-leading-6 tw-font-medium tw-text-gray-900">
                Recent Orders
              </h3>
              <Link
                href="/dashboard/orders"
                className="tw-text-sm tw-font-medium hover:tw-underline"
                style={{ color: '#A6A182' }}
              >
                View all orders →
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="tw-space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="tw-border tw-border-gray-200 tw-rounded-lg tw-p-4">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                      <div className="tw-flex tw-items-center tw-space-x-3">
                        <span className="tw-font-medium tw-text-gray-900">
                          Order #{order.id.substring(0, 8)}
                        </span>
                        <span className={`tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <span className="tw-text-sm tw-text-gray-500">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                    <div className="tw-flex tw-items-center tw-justify-between">
                      <div className="tw-text-sm tw-text-gray-600">
                        {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                        {order.order_items.length > 0 && (
                          <span className="tw-ml-2">
                            {order.order_items[0].product_name}
                            {order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}
                          </span>
                        )}
                      </div>
                      <div className="tw-flex tw-items-center tw-space-x-3">
                        <span className="tw-font-medium tw-text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </span>
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="tw-text-sm tw-font-medium hover:tw-underline"
                          style={{ color: '#A6A182' }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tw-text-center tw-py-8">
                <ShoppingBagIcon className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400" />
                <h3 className="tw-mt-2 tw-text-sm tw-font-medium tw-text-gray-900">No orders yet</h3>
                <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                  Start shopping to see your orders here.
                </p>
                <div className="tw-mt-6">
                  <Link
                    href="/shop"
                    className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-shadow-sm tw-text-sm tw-font-medium tw-rounded-md tw-text-white tw-transition-colors"
                    style={{ backgroundColor: '#A6A182' }}
                  >
                    <ShoppingBagIcon className="tw--ml-1 tw-mr-2 tw-h-5 tw-w-5" />
                    Browse Products
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg">
          <div className="tw-px-4 tw-py-5 sm:tw-p-6">
            <h3 className="tw-text-lg tw-leading-6 tw-font-medium tw-text-gray-900 tw-mb-4">
              Quick Actions
            </h3>
            <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
              <Link
                href="/dashboard/orders"
                className="tw-flex tw-items-center tw-p-4 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors"
              >
                <ShoppingBagIcon className="tw-h-6 tw-w-6 tw-text-gray-400 tw-mr-3" />
                <span className="tw-text-sm tw-font-medium tw-text-gray-900">View All Orders</span>
              </Link>

              <Link
                href="/dashboard/notifications"
                className="tw-flex tw-items-center tw-p-4 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors"
              >
                <BellIcon className="tw-h-6 tw-w-6 tw-text-gray-400 tw-mr-3" />
                <span className="tw-text-sm tw-font-medium tw-text-gray-900">Check Notifications</span>
              </Link>

              <Link
                href="/shop"
                className="tw-flex tw-items-center tw-p-4 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-bg-gray-50 tw-transition-colors"
              >
                <ShoppingBagIcon className="tw-h-6 tw-w-6 tw-text-gray-400 tw-mr-3" />
                <span className="tw-text-sm tw-font-medium tw-text-gray-900">Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
