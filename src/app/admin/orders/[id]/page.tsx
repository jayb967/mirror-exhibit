"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import { useReactToPrint } from 'react-to-print';

interface OrderParams {
  params: {
    id: string;
  };
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image_url: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  user_id: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  payment_method: string;
  stripe_session_id?: string;
  payment_intent_id?: string;
  items: OrderItem[];
  user?: {
    email: string;
  };
}

export default function OrderDetailPage({ params }: OrderParams) {
  const { id } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      // Get order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      // Get order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:product_id (
            name,
            image_url
          )
        `)
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Get user details
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', orderData.user_id)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 is "Row not found" error, which is fine if user doesn't exist
        console.error('Error fetching user:', userError);
      }

      setOrder({
        ...orderData,
        items: itemsData || [],
        user: userData || undefined
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);

      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);

      // Update local state
      if (order) {
        setOrder({
          ...order,
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Order-${id}`,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <SimpleAdminLayout>
        <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent"></div>
          </div>
        </div>
      </SimpleAdminLayout>
    );
  }

  if (!order) {
    return (
      <SimpleAdminLayout>
        <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
          <div className="tw-text-center">
            <h1 className="tw-text-2xl tw-font-bold tw-mb-4">Order Not Found</h1>
            <p className="tw-mb-8 tw-text-gray-600">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
            <button
              onClick={() => router.push('/admin/orders')}
              className="tw-bg-[#A6A182] tw-text-white tw-px-4 tw-py-2 hover:tw-bg-black"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </SimpleAdminLayout>
    );
  }

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <h1 className="tw-text-3xl tw-font-bold">Order Details</h1>
          <div className="tw-flex tw-space-x-2">
            <button
              onClick={() => router.push('/admin/orders')}
              className="tw-bg-gray-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-gray-700"
            >
              Back to Orders
            </button>
            <button
              onClick={handlePrint}
              className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-blue-700"
            >
              Print Invoice
            </button>
          </div>
        </div>

        {/* Order Status and Info */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6 tw-mb-6">
          <div className="tw-flex tw-flex-wrap tw-justify-between tw-items-center tw-mb-4">
            <div>
              <h2 className="tw-text-xl tw-font-semibold">Order #{id.substring(0, 8)}</h2>
              <p className="tw-text-gray-500">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div className="tw-flex tw-items-center tw-space-x-4">
              <span className={`tw-px-3 tw-py-1 tw-text-sm tw-font-semibold tw-rounded-full ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
              <div className="tw-relative">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="tw-block tw-w-full tw-pl-3 tw-pr-10 tw-py-2 tw-text-base tw-border-gray-300 focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500 sm:tw-text-sm tw-rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                {updatingStatus && (
                  <div className="tw-absolute tw-inset-y-0 tw-right-0 tw-pr-3 tw-flex tw-items-center tw-pointer-events-none">
                    <div className="tw-animate-spin tw-h-4 tw-w-4 tw-border-2 tw-border-blue-600 tw-border-t-transparent tw-rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6">
            <div>
              <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-2">Customer</h3>
              <p className="tw-font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              <p className="tw-text-gray-500">{order.user?.email || 'No email available'}</p>
              <p className="tw-text-gray-500">{order.shipping_address.phone}</p>
            </div>

            <div>
              <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-2">Shipping Address</h3>
              <p className="tw-font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              <p className="tw-text-gray-500">{order.shipping_address.address}</p>
              {order.shipping_address.apartment && (
                <p className="tw-text-gray-500">{order.shipping_address.apartment}</p>
              )}
              <p className="tw-text-gray-500">
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </p>
              <p className="tw-text-gray-500">{order.shipping_address.country}</p>
            </div>

            <div>
              <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-2">Payment Information</h3>
              <p className="tw-font-medium">Method: {order.payment_method}</p>
              {order.stripe_session_id && (
                <p className="tw-text-gray-500">Stripe Session: {order.stripe_session_id.substring(0, 12)}...</p>
              )}
              {order.payment_intent_id && (
                <p className="tw-text-gray-500">Payment Intent: {order.payment_intent_id.substring(0, 12)}...</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden tw-mb-6">
          <div className="tw-p-6 tw-border-b tw-border-gray-200">
            <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Order Items</h2>

            <div className="tw-overflow-x-auto">
              <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Product
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Price
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Quantity
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <div className="tw-flex tw-items-center">
                          <div className="tw-flex-shrink-0 tw-h-10 tw-w-10">
                            <Image
                              src={item.product?.image_url || '/assets/placeholder-product.jpg'}
                              alt={item.product?.name || 'Product'}
                              width={40}
                              height={40}
                              className="tw-rounded-md tw-object-cover"
                            />
                          </div>
                          <div className="tw-ml-4">
                            <div className="tw-text-sm tw-font-medium tw-text-gray-900">
                              {item.product?.name || 'Unknown Product'}
                            </div>
                            <div className="tw-text-sm tw-text-gray-500">
                              ID: {item.product_id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500 tw-text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="tw-bg-gray-50">
                  <tr>
                    <td colSpan={3} className="tw-px-6 tw-py-4 tw-text-sm tw-font-medium tw-text-gray-900 tw-text-right">
                      Subtotal
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900 tw-text-right">
                      ${order.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="tw-px-6 tw-py-4 tw-text-sm tw-font-medium tw-text-gray-900 tw-text-right">
                      Shipping
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900 tw-text-right">
                      ${order.shipping.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="tw-px-6 tw-py-4 tw-text-sm tw-font-medium tw-text-gray-900 tw-text-right">
                      Tax
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900 tw-text-right">
                      ${order.tax.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="tw-px-6 tw-py-4 tw-text-base tw-font-bold tw-text-gray-900 tw-text-right">
                      Total
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-base tw-font-bold tw-text-gray-900 tw-text-right">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Printable Invoice */}
        <div className="tw-hidden">
          <div ref={printRef} className="tw-p-8">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-8">
              <div>
                <h1 className="tw-text-2xl tw-font-bold">INVOICE</h1>
                <p className="tw-text-gray-500">Mirror Exhibit</p>
              </div>
              <div className="tw-text-right">
                <h2 className="tw-text-xl tw-font-semibold">Order #{id.substring(0, 8)}</h2>
                <p className="tw-text-gray-500">Date: {formatDate(order.created_at)}</p>
              </div>
            </div>

            <div className="tw-grid tw-grid-cols-2 tw-gap-8 tw-mb-8">
              <div>
                <h3 className="tw-text-lg tw-font-semibold tw-mb-2">Bill To:</h3>
                <p className="tw-font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                <p>{order.shipping_address.address}</p>
                {order.shipping_address.apartment && <p>{order.shipping_address.apartment}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                <p>{order.shipping_address.country}</p>
                <p>{order.shipping_address.phone}</p>
                <p>{order.user?.email}</p>
              </div>
              <div>
                <h3 className="tw-text-lg tw-font-semibold tw-mb-2">Payment Information:</h3>
                <p>Method: {order.payment_method}</p>
                <p>Status: {order.status}</p>
                {order.stripe_session_id && <p>Stripe Session: {order.stripe_session_id}</p>}
                {order.payment_intent_id && <p>Payment Intent: {order.payment_intent_id}</p>}
              </div>
            </div>

            <table className="tw-w-full tw-mb-8">
              <thead>
                <tr className="tw-border-b-2 tw-border-gray-300">
                  <th className="tw-text-left tw-py-2">Product</th>
                  <th className="tw-text-right tw-py-2">Price</th>
                  <th className="tw-text-right tw-py-2">Quantity</th>
                  <th className="tw-text-right tw-py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="tw-border-b tw-border-gray-200">
                    <td className="tw-py-2">{item.product?.name || 'Unknown Product'}</td>
                    <td className="tw-text-right tw-py-2">${item.price.toFixed(2)}</td>
                    <td className="tw-text-right tw-py-2">{item.quantity}</td>
                    <td className="tw-text-right tw-py-2">${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="tw-text-right tw-py-2">Subtotal</td>
                  <td className="tw-text-right tw-py-2">${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="tw-text-right tw-py-2">Shipping</td>
                  <td className="tw-text-right tw-py-2">${order.shipping.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="tw-text-right tw-py-2">Tax</td>
                  <td className="tw-text-right tw-py-2">${order.tax.toFixed(2)}</td>
                </tr>
                <tr className="tw-font-bold">
                  <td colSpan={3} className="tw-text-right tw-py-2">Total</td>
                  <td className="tw-text-right tw-py-2">${order.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="tw-text-center tw-text-gray-500 tw-text-sm">
              <p>Thank you for your business!</p>
              <p>Mirror Exhibit - Custom Laser-Engraved Mirrors</p>
            </div>
          </div>
        </div>
      </div>
    </SimpleAdminLayout>
  );
}
