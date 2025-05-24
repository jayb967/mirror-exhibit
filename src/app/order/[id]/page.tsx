'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

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

interface ShippingAddress {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  payment_method: string;
  payment_status: string;
  shipping_method: string;
  tracking_number?: string;
  notes?: string;
  user_id?: string;
  guest_token?: string;
  guest_email?: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    fetchOrderDetails();
  }, [params.id]);
  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      if (user) {
        // Fetch order for authenticated user
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(
              id,
              product_id,
              quantity,
              price,
              product:products(
                id,
                name,
                image_url
              )
            ),
            shipping_address:shipping_addresses(*)
          `)
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        setOrder({
          ...data,
          items: data.items || []
        });
      } else if (email) {
        // Fetch order for guest user
        const response = await fetch(`/api/guest/orders?orderId=${params.id}&email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch order');
        }
        
        const { order: orderData } = await response.json();
        setOrder(orderData);
      } else {
        // No authentication or email provided
        toast.error('Please sign in or provide your email to view this order');
        router.push('/order/track');
      }
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast.error(error.message || 'Failed to load order details');
      router.push('/order/track');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'tw-bg-yellow-100 tw-text-yellow-800';
      case 'processing':
        return 'tw-bg-blue-100 tw-text-blue-800';
      case 'shipped':
        return 'tw-bg-green-100 tw-text-green-800';
      case 'delivered':
        return 'tw-bg-green-100 tw-text-green-800';
      case 'canceled':
        return 'tw-bg-red-100 tw-text-red-800';
      default:
        return 'tw-bg-gray-100 tw-text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-16 tw-text-center">
        <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-t-2 tw-border-b-2 tw-border-blue-500 tw-mx-auto"></div>
        <p className="tw-mt-4 tw-text-gray-600">Loading order details...</p>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-16 tw-text-center">
        <div className="tw-mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-16 tw-w-16 tw-text-red-500 tw-mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="tw-text-2xl tw-font-bold tw-mb-4">Order Not Found</h1>
        <p className="tw-mb-8 tw-text-gray-600">We couldn't find the order you're looking for.</p>
        <Link href="/shop" className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-6 tw-py-3 tw-rounded-md tw-font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-12">
      <div className="tw-max-w-4xl tw-mx-auto">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-8">
          <h1 className="tw-text-3xl tw-font-bold">Order Details</h1>
          <Link href="/shop" className="tw-text-blue-600 hover:tw-underline">
            Continue Shopping
          </Link>
        </div>
        
        {/* Order Summary */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6 tw-mb-8">
          <div className="tw-flex tw-flex-wrap tw-justify-between tw-items-center tw-mb-6">
            <div>
              <h2 className="tw-text-xl tw-font-semibold">Order #{order.id.substring(0, 8)}</h2>
              <p className="tw-text-gray-500">Placed on {formatDate(order.created_at)}</p>
            </div>
            <span className={`tw-px-3 tw-py-1 tw-text-sm tw-font-semibold tw-rounded-full ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
            <div>
              <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-2">Shipping Address</h3>
              <p className="tw-font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              <p>{order.shipping_address.address}</p>
              {order.shipping_address.apartment && <p>{order.shipping_address.apartment}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
              <p>{order.shipping_address.country}</p>
              <p>{order.shipping_address.phone}</p>
            </div>
            
            <div>
              <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-2">Order Summary</h3>
              <div className="tw-flex tw-justify-between tw-mb-1">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="tw-flex tw-justify-between tw-mb-1">
                <span>Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="tw-flex tw-justify-between tw-mb-1">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="tw-flex tw-justify-between tw-mb-1">
                  <span>Discount:</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="tw-flex tw-justify-between tw-font-bold tw-mt-2 tw-pt-2 tw-border-t">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden tw-mb-8">
          <div className="tw-p-6 tw-border-b tw-border-gray-200">
            <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Order Items</h2>
          </div>
          
          <div className="tw-divide-y tw-divide-gray-200">
            {order.items.map((item) => (
              <div key={item.id} className="tw-p-6 tw-flex tw-items-center">
                <div className="tw-relative tw-h-20 tw-w-20 tw-mr-4 tw-flex-shrink-0">
                  <Image
                    src={item.product?.image_url || '/assets/placeholder-product.jpg'}
                    alt={item.product?.name || 'Product'}
                    width={80}
                    height={80}
                    className="tw-rounded-md tw-object-cover"
                  />
                </div>
                <div className="tw-flex-1">
                  <h3 className="tw-text-sm tw-font-medium tw-text-gray-900">{item.product?.name}</h3>
                  <p className="tw-text-sm tw-text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <div className="tw-font-bold tw-text-gray-900 tw-text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tracking Information */}
        {order.tracking_number && (
          <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6 tw-mb-8">
            <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Tracking Information</h2>
            <p className="tw-mb-2">
              Tracking Number: <span className="tw-font-medium">{order.tracking_number}</span>
            </p>
            <p className="tw-mb-4">
              Shipping Method: <span className="tw-font-medium">{order.shipping_method}</span>
            </p>
            <Link 
              href={`/order/track-shipment?tracking=${order.tracking_number}`}
              className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-text-sm tw-font-medium"
            >
              Track Shipment
            </Link>
          </div>
        )}
        
        {/* Need Help */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Need Help?</h2>
          <p className="tw-mb-4">If you have any questions about your order, please contact our customer support team.</p>
          <Link 
            href="/contact"
            className="tw-text-blue-600 hover:tw-underline"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
