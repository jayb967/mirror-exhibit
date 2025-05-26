'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useClerkAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import {
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface OrderDetails {
  order: {
    id: string;
    created_at: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    shipping_cost: number;
    discount_amount: number;
    total_amount: number;
    shipping_address: any;
    tracking_number?: string;
    tracking_url?: string;
    courier_name?: string;
    estimated_delivery_date?: string;
    shipped_at?: string;
    delivered_at?: string;
    order_items: Array<{
      id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      size_name?: string;
      frame_type?: string;
      sku?: string;
    }>;
  };
  statusHistory: Array<{
    previous_status: string;
    new_status: string;
    created_at: string;
    change_reason?: string;
  }>;
  orderNotes: Array<{
    note_content: string;
    created_at: string;
    note_type: string;
  }>;
}

const OrderDetailsPage: React.FC<{ params: { id: string } }> = ({ params }) => {
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/orders/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else if (response.status === 404) {
        setError('Order not found');
      } else {
        setError('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (user?.id) {
      fetchOrderDetails();
    }
  }, [user?.id, fetchOrderDetails]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="tw-h-5 tw-w-5 tw-text-green-600" />;
      case 'shipped':
      case 'out_for_delivery':
        return <TruckIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
      case 'canceled':
      case 'refunded':
        return <ExclamationTriangleIcon className="tw-h-5 tw-w-5 tw-text-red-600" />;
      default:
        return <ClockIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
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

  if (error || !orderDetails) {
    return (
      <DashboardLayout>
        <div className="tw-text-center tw-py-12">
          <ExclamationTriangleIcon className="tw-mx-auto tw-h-12 tw-w-12 tw-text-red-400" />
          <h3 className="tw-mt-2 tw-text-sm tw-font-medium tw-text-gray-900">
            {error || 'Order not found'}
          </h3>
          <div className="tw-mt-6">
            <Link
              href="/dashboard/orders"
              className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-shadow-sm tw-text-sm tw-font-medium tw-rounded-md tw-text-white"
              style={{ backgroundColor: '#A6A182' }}
            >
              <ArrowLeftIcon className="tw--ml-1 tw-mr-2 tw-h-5 tw-w-5" />
              Back to Orders
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { order } = orderDetails;

  return (
    <DashboardLayout>
      <div className="tw-space-y-6">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-space-x-4">
            <Link
              href="/dashboard/orders"
              className="tw-inline-flex tw-items-center tw-text-sm tw-text-gray-500 hover:tw-text-gray-700"
            >
              <ArrowLeftIcon className="tw-h-4 tw-w-4 tw-mr-1" />
              Back to Orders
            </Link>
            <div>
              <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">
                Order #{order.id.substring(0, 8)}
              </h1>
              <p className="tw-text-sm tw-text-gray-600">
                Placed on {formatDate(order.created_at)}
              </p>
            </div>
          </div>
          <div className="tw-flex tw-items-center tw-space-x-3">
            {getStatusIcon(order.status)}
            <span className={`tw-px-3 tw-py-1 tw-text-sm tw-font-medium tw-rounded-full tw-border ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-3 tw-gap-6">
          {/* Main Content */}
          <div className="lg:tw-col-span-2 tw-space-y-6">
            {/* Order Items */}
            <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
              <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
                <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Order Items</h3>
              </div>
              <div className="tw-divide-y tw-divide-gray-200">
                {order.order_items.map((item) => (
                  <div key={item.id} className="tw-p-6">
                    <div className="tw-flex tw-items-center tw-justify-between">
                      <div className="tw-flex-1">
                        <h4 className="tw-text-sm tw-font-medium tw-text-gray-900">
                          {item.product_name}
                        </h4>
                        <div className="tw-mt-1 tw-text-sm tw-text-gray-500">
                          {item.size_name && <span>Size: {item.size_name}</span>}
                          {item.frame_type && <span className="tw-ml-2">Frame: {item.frame_type}</span>}
                          {item.sku && <span className="tw-ml-2">SKU: {item.sku}</span>}
                        </div>
                        <div className="tw-mt-1 tw-text-sm tw-text-gray-500">
                          Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                      <div className="tw-text-right">
                        <p className="tw-text-sm tw-font-medium tw-text-gray-900">
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Information */}
            {order.tracking_number && (
              <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
                <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
                  <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Tracking Information</h3>
                </div>
                <div className="tw-p-6">
                  <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                    <div>
                      <p className="tw-text-sm tw-font-medium tw-text-gray-900">
                        Tracking Number: {order.tracking_number}
                      </p>
                      {order.courier_name && (
                        <p className="tw-text-sm tw-text-gray-500">
                          Carrier: {order.courier_name}
                        </p>
                      )}
                      {order.estimated_delivery_date && (
                        <p className="tw-text-sm tw-text-gray-500">
                          Estimated Delivery: {formatDate(order.estimated_delivery_date)}
                        </p>
                      )}
                    </div>
                    {order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-text-white tw-shadow-sm hover:tw-opacity-90"
                        style={{ backgroundColor: '#A6A182' }}
                      >
                        <TruckIcon className="tw--ml-1 tw-mr-2 tw-h-4 tw-w-4" />
                        Track Package
                      </a>
                    )}
                  </div>

                  {/* Tracking Status */}
                  <div className="tw-mt-6">
                    <h4 className="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-3">
                      Shipping Status
                    </h4>
                    <div className="tw-space-y-3">
                      <div className="tw-flex tw-items-start tw-space-x-3">
                        <div className="tw-flex-shrink-0 tw-w-2 tw-h-2 tw-rounded-full tw-mt-2" style={{ backgroundColor: '#A6A182' }}></div>
                        <div className="tw-flex-1">
                          <p className="tw-text-sm tw-font-medium tw-text-gray-900">
                            Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </p>
                          <p className="tw-text-xs tw-text-gray-500">
                            {order.shipped_at ? formatDate(order.shipped_at) : formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      {order.delivered_at && (
                        <div className="tw-flex tw-items-start tw-space-x-3">
                          <div className="tw-flex-shrink-0 tw-w-2 tw-h-2 tw-rounded-full tw-mt-2" style={{ backgroundColor: '#A6A182' }}></div>
                          <div className="tw-flex-1">
                            <p className="tw-text-sm tw-font-medium tw-text-gray-900">
                              Package Delivered
                            </p>
                            <p className="tw-text-xs tw-text-gray-500">
                              {formatDate(order.delivered_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Notes */}
            {orderDetails.orderNotes.length > 0 && (
              <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
                <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
                  <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Order Notes</h3>
                </div>
                <div className="tw-divide-y tw-divide-gray-200">
                  {orderDetails.orderNotes.map((note, index) => (
                    <div key={index} className="tw-p-6">
                      <p className="tw-text-sm tw-text-gray-900">{note.note_content}</p>
                      <p className="tw-mt-1 tw-text-xs tw-text-gray-500">
                        {formatDate(note.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="tw-space-y-6">
            {/* Order Summary */}
            <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
              <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
                <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Order Summary</h3>
              </div>
              <div className="tw-p-6 tw-space-y-3">
                <div className="tw-flex tw-justify-between tw-text-sm">
                  <span className="tw-text-gray-600">Subtotal</span>
                  <span className="tw-text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.tax_amount > 0 && (
                  <div className="tw-flex tw-justify-between tw-text-sm">
                    <span className="tw-text-gray-600">Tax</span>
                    <span className="tw-text-gray-900">{formatCurrency(order.tax_amount)}</span>
                  </div>
                )}
                <div className="tw-flex tw-justify-between tw-text-sm">
                  <span className="tw-text-gray-600">Shipping</span>
                  <span className="tw-text-gray-900">
                    {order.shipping_cost > 0 ? formatCurrency(order.shipping_cost) : 'Free'}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="tw-flex tw-justify-between tw-text-sm">
                    <span className="tw-text-gray-600">Discount</span>
                    <span className="tw-text-green-600">-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="tw-border-t tw-border-gray-200 tw-pt-3">
                  <div className="tw-flex tw-justify-between tw-text-base tw-font-medium">
                    <span className="tw-text-gray-900">Total</span>
                    <span className="tw-text-gray-900">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
              <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
                <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Shipping Address</h3>
              </div>
              <div className="tw-p-6">
                <div className="tw-text-sm tw-text-gray-900">
                  {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                  <br />
                  {order.shipping_address?.address_line_1}
                  <br />
                  {order.shipping_address?.address_line_2 && (
                    <>
                      {order.shipping_address.address_line_2}
                      <br />
                    </>
                  )}
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                  <br />
                  {order.shipping_address?.country}
                  {order.shipping_address?.phone && (
                    <>
                      <br />
                      {order.shipping_address.phone}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Status History */}
            {orderDetails.statusHistory.length > 0 && (
              <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
                <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
                  <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Status History</h3>
                </div>
                <div className="tw-p-6">
                  <div className="tw-space-y-3">
                    {orderDetails.statusHistory.map((history, index) => (
                      <div key={index} className="tw-flex tw-items-start tw-space-x-3">
                        <div className="tw-flex-shrink-0 tw-w-2 tw-h-2 tw-rounded-full tw-mt-2" style={{ backgroundColor: '#A6A182' }}></div>
                        <div className="tw-flex-1">
                          <p className="tw-text-sm tw-font-medium tw-text-gray-900">
                            {history.previous_status} → {history.new_status}
                          </p>
                          <p className="tw-text-xs tw-text-gray-500">
                            {formatDate(history.created_at)}
                          </p>
                          {history.change_reason && (
                            <p className="tw-text-xs tw-text-gray-500">
                              {history.change_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetailsPage;
