"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import Link from 'next/link';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  user_id: string;
  user_name?: string;
  shipping_address: {
    first_name: string;
    last_name: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Build the query
      let query = supabase
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
      const from = (currentPage - 1) * ordersPerPage;
      const to = from + ordersPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq(statusFilter ? 'status' : 'id', statusFilter || 'id');

      if (countError) throw countError;

      // Process orders to include user name
      const processedOrders = data?.map(order => ({
        ...order,
        user_name: order.profiles
          ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || 'Anonymous'
          : 'Anonymous'
      })) || [];

      setOrders(processedOrders);
      setTotalPages(Math.ceil((totalCount || 0) / ordersPerPage));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter orders based on search query
    if (searchQuery.trim()) {
      const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.status.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setOrders(filteredOrders);
    } else {
      // If search query is empty, reset to fetch all orders
      fetchOrders();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'delivered':
        return 'tw-bg-green-100 tw-text-green-800';
      case 'pending':
      case 'processing':
        return 'tw-bg-yellow-100 tw-text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'tw-bg-red-100 tw-text-red-800';
      case 'refunded':
        return 'tw-bg-purple-100 tw-text-purple-800';
      default:
        return 'tw-bg-gray-100 tw-text-gray-800';
    }
  };

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <h1 className="tw-text-3xl tw-font-bold">Orders</h1>
          <div className="tw-flex tw-space-x-2">
            <form onSubmit={handleSearch} className="tw-flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-l-md focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
              />
              <button
                type="submit"
                className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-r-md hover:tw-bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden tw-mb-6">
          <div className="tw-p-4 tw-border-b tw-border-gray-200">
            <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
              <span className="tw-text-sm tw-font-medium tw-text-gray-700">Filter by status:</span>
              <button
                onClick={() => setStatusFilter('')}
                className={`tw-px-3 tw-py-1 tw-text-sm tw-rounded-full ${
                  statusFilter === '' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-gray-100 tw-text-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`tw-px-3 tw-py-1 tw-text-sm tw-rounded-full ${
                  statusFilter === 'pending' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-gray-100 tw-text-gray-800'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`tw-px-3 tw-py-1 tw-text-sm tw-rounded-full ${
                  statusFilter === 'paid' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-gray-100 tw-text-gray-800'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setStatusFilter('processing')}
                className={`tw-px-3 tw-py-1 tw-text-sm tw-rounded-full ${
                  statusFilter === 'processing' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-gray-100 tw-text-gray-800'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`tw-px-3 tw-py-1 tw-text-sm tw-rounded-full ${
                  statusFilter === 'completed' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-gray-100 tw-text-gray-800'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`tw-px-3 tw-py-1 tw-text-sm tw-rounded-full ${
                  statusFilter === 'cancelled' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-gray-100 tw-text-gray-800'
                }`}
              >
                Cancelled
              </button>
              <button
                onClick={() => setStatusFilter('refunded')}
                className={`tw-px-3 tw-py-1 tw-text-sm tw-rounded-full ${
                  statusFilter === 'refunded' ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-gray-100 tw-text-gray-800'
                }`}
              >
                Refunded
              </button>
            </div>
          </div>

          {loading ? (
            <div className="tw-flex tw-justify-center tw-items-center tw-p-8">
              <div className="tw-animate-spin tw-w-8 tw-h-8 tw-border-4 tw-border-blue-600 tw-border-t-transparent tw-rounded-full"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="tw-p-8 tw-text-center tw-text-gray-500">
              No orders found.
            </div>
          ) : (
            <div className="tw-overflow-x-auto">
              <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Order ID
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Customer
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Date
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Total
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Status
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:tw-bg-gray-50">
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {order.user_name}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <span className={`tw-px-2 tw-inline-flex tw-text-xs tw-leading-5 tw-font-semibold tw-rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                        <div className="tw-flex tw-justify-end tw-space-x-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="tw-text-blue-600 hover:tw-text-blue-900"
                          >
                            View
                          </Link>
                          <div className="tw-relative tw-inline-block tw-text-left">
                            <div>
                              <button
                                type="button"
                                className="tw-text-gray-600 hover:tw-text-gray-900 focus:tw-outline-none"
                                id={`status-menu-${order.id}`}
                                aria-expanded="true"
                                aria-haspopup="true"
                              >
                                Change Status
                              </button>
                            </div>
                            <div className="tw-origin-top-right tw-absolute tw-right-0 tw-mt-2 tw-w-56 tw-rounded-md tw-shadow-lg tw-bg-white tw-ring-1 tw-ring-black tw-ring-opacity-5 tw-focus:outline-none tw-hidden group-hover:tw-block">
                              <div className="tw-py-1" role="menu" aria-orientation="vertical" aria-labelledby={`status-menu-${order.id}`}>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'pending')}
                                  className="tw-text-gray-700 tw-block tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-gray-100 tw-w-full tw-text-left"
                                  role="menuitem"
                                >
                                  Pending
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'processing')}
                                  className="tw-text-gray-700 tw-block tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-gray-100 tw-w-full tw-text-left"
                                  role="menuitem"
                                >
                                  Processing
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'completed')}
                                  className="tw-text-gray-700 tw-block tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-gray-100 tw-w-full tw-text-left"
                                  role="menuitem"
                                >
                                  Completed
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'cancelled')}
                                  className="tw-text-gray-700 tw-block tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-gray-100 tw-w-full tw-text-left"
                                  role="menuitem"
                                >
                                  Cancelled
                                </button>
                                <button
                                  onClick={() => handleStatusChange(order.id, 'refunded')}
                                  className="tw-text-gray-700 tw-block tw-px-4 tw-py-2 tw-text-sm hover:tw-bg-gray-100 tw-w-full tw-text-left"
                                  role="menuitem"
                                >
                                  Refunded
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="tw-px-6 tw-py-4 tw-flex tw-items-center tw-justify-between tw-border-t tw-border-gray-200">
              <div className="tw-flex-1 tw-flex tw-justify-between sm:tw-hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="tw-ml-3 tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="tw-hidden sm:tw-flex-1 sm:tw-flex sm:tw-items-center sm:tw-justify-between">
                <div>
                  <p className="tw-text-sm tw-text-gray-700">
                    Showing <span className="tw-font-medium">{(currentPage - 1) * ordersPerPage + 1}</span> to{' '}
                    <span className="tw-font-medium">
                      {Math.min(currentPage * ordersPerPage, orders.length)}
                    </span>{' '}
                    of <span className="tw-font-medium">{totalPages * ordersPerPage}</span> results
                  </p>
                </div>
                <div>
                  <nav className="tw-relative tw-z-0 tw-inline-flex tw-rounded-md tw-shadow-sm -tw-space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="tw-relative tw-inline-flex tw-items-center tw-px-2 tw-py-2 tw-rounded-l-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                    >
                      <span className="tw-sr-only">Previous</span>
                      &larr;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-text-sm tw-font-medium ${
                          page === currentPage
                            ? 'tw-z-10 tw-bg-blue-50 tw-border-blue-500 tw-text-blue-600'
                            : 'tw-bg-white tw-border-gray-300 tw-text-gray-500 hover:tw-bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="tw-relative tw-inline-flex tw-items-center tw-px-2 tw-py-2 tw-rounded-r-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                    >
                      <span className="tw-sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleAdminLayout>
  );
}
