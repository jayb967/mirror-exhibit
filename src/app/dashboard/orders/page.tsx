'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useClerkAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  tracking_number?: string;
  tracking_url?: string;
  courier_name?: string;
  estimated_delivery_date?: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    size_name?: string;
    frame_type?: string;
  }>;
}

interface OrdersData {
  orders: Order[];
  total: number;
  summary: {
    totalOrders: number;
    totalSpent: number;
    ordersByStatus: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, currentPage, statusFilter, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/dashboard/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrdersData(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
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
        return 'tw-text-yellow-700 tw-bg-yellow-100 tw-border-yellow-200';
      case 'paid':
      case 'processing':
        return 'tw-text-gray-700 tw-bg-gray-100 tw-border-gray-200';
      case 'shipped':
      case 'out_for_delivery':
        return 'tw-text-gray-800 tw-bg-gray-200 tw-border-gray-300';
      case 'delivered':
        return 'tw-text-green-700 tw-bg-green-100 tw-border-green-200';
      case 'canceled':
      case 'refunded':
        return 'tw-text-red-700 tw-bg-red-100 tw-border-red-200';
      default:
        return 'tw-text-gray-700 tw-bg-gray-100 tw-border-gray-200';
    }
  };

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  if (loading && !ordersData) {
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
        {/* Header */}
        <div>
          <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">My Orders</h1>
          <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
            Track and manage your order history
          </p>
        </div>

        {/* Summary Stats */}
        {ordersData?.summary && (
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
            <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
              <div className="tw-p-5">
                <div className="tw-flex tw-items-center">
                  <div className="tw-flex-shrink-0">
                    <div className="tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center" style={{ backgroundColor: '#A6A182' }}>
                      <span className="tw-text-white tw-font-bold tw-text-sm">{ordersData.summary.totalOrders}</span>
                    </div>
                  </div>
                  <div className="tw-ml-5 tw-w-0 tw-flex-1">
                    <dl>
                      <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                        Total Orders
                      </dt>
                      <dd className="tw-text-lg tw-font-medium tw-text-gray-900">
                        {ordersData.summary.totalOrders} orders
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
                    <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-green-500 tw-flex tw-items-center tw-justify-center">
                      <span className="tw-text-white tw-font-bold tw-text-sm">$</span>
                    </div>
                  </div>
                  <div className="tw-ml-5 tw-w-0 tw-flex-1">
                    <dl>
                      <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                        Total Spent
                      </dt>
                      <dd className="tw-text-lg tw-font-medium tw-text-gray-900">
                        {formatCurrency(ordersData.summary.totalSpent)}
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
                    <div className="tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center" style={{ backgroundColor: '#A6A182' }}>
                      <TruckIcon className="tw-h-4 tw-w-4 tw-text-white" />
                    </div>
                  </div>
                  <div className="tw-ml-5 tw-w-0 tw-flex-1">
                    <dl>
                      <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                        In Progress
                      </dt>
                      <dd className="tw-text-lg tw-font-medium tw-text-gray-900">
                        {(ordersData.summary.ordersByStatus.pending || 0) +
                         (ordersData.summary.ordersByStatus.confirmed || 0) +
                         (ordersData.summary.ordersByStatus.paid || 0) +
                         (ordersData.summary.ordersByStatus.processing || 0) +
                         (ordersData.summary.ordersByStatus.shipped || 0) +
                         (ordersData.summary.ordersByStatus.out_for_delivery || 0)} orders
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-p-6">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4">
            <form onSubmit={handleSearch} className="tw-flex-1">
              <div className="tw-relative">
                <MagnifyingGlassIcon className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-h-5 tw-w-5 tw-text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="tw-block tw-w-full tw-pl-10 tw-pr-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-leading-5 tw-bg-white tw-placeholder-gray-500 focus:tw-outline-none focus:tw-placeholder-gray-400 focus:tw-ring-1 focus:tw-ring-indigo-500 focus:tw-border-indigo-500"
                />
              </div>
            </form>

            <div className="tw-flex tw-items-center tw-space-x-2">
              <FunnelIcon className="tw-h-5 tw-w-5 tw-text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="tw-block tw-w-full tw-pl-3 tw-pr-10 tw-py-2 tw-text-base tw-border-gray-300 focus:tw-outline-none tw-rounded-md"
                  style={{
                    borderColor: '#A6A182',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#A6A182'}
                  onBlur={(e) => e.target.style.borderColor = '#A6A182'}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
          {ordersData?.orders && ordersData.orders.length > 0 ? (
            <div className="tw-divide-y tw-divide-gray-200">
              {ordersData.orders.map((order) => (
                <div key={order.id} className="tw-p-6 hover:tw-bg-gray-50 tw-transition-colors">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                    <div className="tw-flex tw-items-center tw-space-x-4">
                      <div>
                        <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">
                          Order #{order.id.substring(0, 8)}
                        </h3>
                        <p className="tw-text-sm tw-text-gray-500">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span className={`tw-px-3 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full tw-border ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="tw-text-right">
                      <p className="tw-text-lg tw-font-medium tw-text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </p>
                      <p className="tw-text-sm tw-text-gray-500">
                        {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="tw-mb-4">
                    <div className="tw-space-y-2">
                      {order.order_items.slice(0, 2).map((item) => (
                        <div key={item.id} className="tw-flex tw-justify-between tw-text-sm">
                          <span className="tw-text-gray-600">
                            {item.quantity}x {item.product_name}
                            {item.size_name && ` - ${item.size_name}`}
                            {item.frame_type && ` (${item.frame_type})`}
                          </span>
                          <span className="tw-text-gray-900">
                            {formatCurrency(item.unit_price)}
                          </span>
                        </div>
                      ))}
                      {order.order_items.length > 2 && (
                        <p className="tw-text-sm tw-text-gray-500">
                          +{order.order_items.length - 2} more item{order.order_items.length - 2 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {order.tracking_number && (
                    <div className="tw-mb-4 tw-p-3 tw-rounded-md" style={{ backgroundColor: '#F8F8F8' }}>
                      <div className="tw-flex tw-items-center tw-space-x-2">
                        <TruckIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />
                        <div>
                          <p className="tw-text-sm tw-font-medium tw-text-gray-900">
                            Tracking: {order.tracking_number}
                          </p>
                          {order.courier_name && (
                            <p className="tw-text-xs tw-text-gray-700">
                              Carrier: {order.courier_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex tw-space-x-3">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500"
                      >
                        <EyeIcon className="tw--ml-0.5 tw-mr-2 tw-h-4 tw-w-4" />
                        View Details
                      </Link>

                      {order.tracking_url && (
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-white tw-shadow-sm hover:tw-opacity-90 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2"
                          style={{ backgroundColor: '#A6A182' }}
                        >
                          <TruckIcon className="tw--ml-0.5 tw-mr-2 tw-h-4 tw-w-4" />
                          Track Package
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tw-text-center tw-py-12">
              <div className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="tw-mt-2 tw-text-sm tw-font-medium tw-text-gray-900">No orders found</h3>
              <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                {statusFilter || searchTerm ? 'Try adjusting your filters.' : 'Start shopping to see your orders here.'}
              </p>
              {!statusFilter && !searchTerm && (
                <div className="tw-mt-6">
                  <Link
                    href="/shop"
                    className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-shadow-sm tw-text-sm tw-font-medium tw-rounded-md tw-text-white"
                    style={{ backgroundColor: '#A6A182' }}
                  >
                    Browse Products
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {ordersData && ordersData.total > itemsPerPage && (
          <div className="tw-flex tw-items-center tw-justify-between tw-bg-white tw-px-4 tw-py-3 tw-border tw-border-gray-200 tw-rounded-lg">
            <div className="tw-flex tw-flex-1 tw-justify-between sm:tw-hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!ordersData.pagination.hasMore}
                className="tw-ml-3 tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="tw-hidden sm:tw-flex tw-flex-1 tw-items-center tw-justify-between">
              <div>
                <p className="tw-text-sm tw-text-gray-700">
                  Showing{' '}
                  <span className="tw-font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="tw-font-medium">
                    {Math.min(currentPage * itemsPerPage, ordersData.total)}
                  </span>
                  {' '}of{' '}
                  <span className="tw-font-medium">{ordersData.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="tw-relative tw-z-0 tw-inline-flex tw-rounded-md tw-shadow-sm -tw-space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="tw-relative tw-inline-flex tw-items-center tw-px-2 tw-py-2 tw-rounded-l-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!ordersData.pagination.hasMore}
                    className="tw-relative tw-inline-flex tw-items-center tw-px-2 tw-py-2 tw-rounded-r-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
