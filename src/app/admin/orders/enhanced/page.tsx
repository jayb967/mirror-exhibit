'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BasicAdminLayout from '@/components/admin/BasicAdminLayout';
import OrderManagement from '@/components/admin/OrderManagement';

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  tracking_number?: string;
  shipping_address: any;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface OrdersData {
  orders: Order[];
  total: number;
  totalPages: number;
}

const EnhancedOrdersPage: React.FC = () => {
  const router = useRouter();
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (dateFilter) {
        params.append('date_filter', dateFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrdersData(data);
      } else {
        console.error('Failed to fetch orders');
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          notes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }

      toast.success(`Order status updated to ${newStatus}`);

      // Create admin notification for status change via API
      try {
        await fetch('/api/admin/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'admin_order_status_update',
            title: `Order #${orderId.substring(0, 8)} status updated`,
            message: `Order status changed to ${newStatus}${notes ? ` - ${notes}` : ''}`,
            actionUrl: `/admin/orders/${orderId}`,
            data: { orderId, newStatus, notes },
            adminOnly: true
          }),
        });
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the whole operation if notification fails
      }

      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      throw error; // Re-throw to let OrderManagement handle it
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleExportOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date_filter', dateFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('export', 'true');

      const response = await fetch(`/api/admin/orders/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Orders exported successfully');
      } else {
        throw new Error('Failed to export orders');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
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

  const dateOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
  ];

  return (
    <BasicAdminLayout>
      <div className="tw-space-y-6">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-justify-between">
          <div>
            <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">Order Management</h1>
            <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
              Manage and track customer orders
            </p>
          </div>
          <div className="tw-flex tw-items-center tw-space-x-3">
            <button
              onClick={handleExportOrders}
              className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50"
            >
              <ArrowDownTrayIcon className="tw--ml-1 tw-mr-2 tw-h-5 tw-w-5" />
              Export Orders
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-p-6">
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="tw-flex">
              <div className="tw-relative tw-flex-1">
                <MagnifyingGlassIcon className="tw-absolute tw-left-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-h-5 tw-w-5 tw-text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="tw-block tw-w-full tw-pl-10 tw-pr-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-leading-5 tw-bg-white tw-placeholder-gray-500 focus:tw-outline-none focus:tw-placeholder-gray-400 focus:tw-ring-1 focus:tw-border-indigo-500"
                  style={{ borderColor: '#A6A182' }}
                />
              </div>
            </form>

            {/* Status Filter */}
            <div className="tw-flex tw-items-center tw-space-x-2">
              <FunnelIcon className="tw-h-5 tw-w-5 tw-text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="tw-block tw-w-full tw-pl-3 tw-pr-10 tw-py-2 tw-text-base tw-border-gray-300 focus:tw-outline-none tw-rounded-md"
                style={{ borderColor: '#A6A182' }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="tw-block tw-w-full tw-pl-3 tw-pr-10 tw-py-2 tw-text-base tw-border-gray-300 focus:tw-outline-none tw-rounded-md"
                style={{ borderColor: '#A6A182' }}
              >
                {dateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(statusFilter || dateFilter || searchTerm) && (
              <div>
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setDateFilter('');
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Orders Summary */}
        {ordersData && (
          <div className="tw-bg-white tw-shadow tw-rounded-lg tw-p-6">
            <div className="tw-flex tw-items-center tw-justify-between">
              <div>
                <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">
                  Orders Overview
                </h3>
                <p className="tw-text-sm tw-text-gray-600">
                  Showing {ordersData.orders.length} of {ordersData.total} orders
                </p>
              </div>
              <div className="tw-text-right">
                <p className="tw-text-2xl tw-font-bold" style={{ color: '#A6A182' }}>
                  {ordersData.total}
                </p>
                <p className="tw-text-sm tw-text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Management Component */}
        <OrderManagement
          orders={ordersData?.orders || []}
          onStatusUpdate={handleStatusUpdate}
          onViewOrder={handleViewOrder}
          loading={loading}
        />

        {/* Pagination */}
        {ordersData && ordersData.totalPages > 1 && (
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
                onClick={() => setCurrentPage(Math.min(ordersData.totalPages, currentPage + 1))}
                disabled={currentPage === ordersData.totalPages}
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
                    onClick={() => setCurrentPage(Math.min(ordersData.totalPages, currentPage + 1))}
                    disabled={currentPage === ordersData.totalPages}
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
    </BasicAdminLayout>
  );
};

export default EnhancedOrdersPage;
