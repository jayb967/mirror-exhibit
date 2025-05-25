"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSupabaseClient } from '@/utils/supabase-client';
import { toast } from "react-toastify";
import CreateAccountBanner from "@/components/checkout/CreateAccountBanner";

interface OrderDetails {
  id: string;
  created_at: string;
  status: string;
  total: number;
  user_id?: string;
  guest_token?: string;
  guest_email?: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
  };
  items: OrderItem[];
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

function OrderSuccessContent() {
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        if (!sessionId) {
          toast.error("Invalid session ID");
          router.push("/shop");
          return;
        }

        // Verify user authentication
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // NEW FLOW: Always create order immediately after payment success
        console.log('Creating order from successful payment session:', sessionId);

        const createResponse = await fetch('/api/orders/create-from-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!createResponse.ok) {
          const createError = await createResponse.json();
          console.error("Error creating order:", createError);

          // If order already exists, try to fetch it
          if (createError.message && createError.message.includes('already exists')) {
            const fetchResponse = await fetch('/api/orders/get-by-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionId, userId }),
            });

            if (fetchResponse.ok) {
              const fetchData = await fetchResponse.json();
              if (fetchData.order) {
                setOrderDetails({
                  ...fetchData.order,
                  items: fetchData.order.order_items || []
                });
                return;
              }
            }
          }

          toast.error("Failed to process your order. Please contact support.");
          return;
        }

        const createData = await createResponse.json();
        console.log('Order created successfully:', createData);

        if (createData.order) {
          setOrderDetails({
            ...createData.order,
            items: createData.order.order_items || []
          });
          toast.success("Your order has been created successfully!");
        } else {
          toast.error("Failed to create order details");
        }


      } catch (error) {
        console.error("Error processing order success:", error);
        toast.error("Failed to process order information");
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [sessionId, supabase, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="tw-container tw-mx-auto tw-py-16 tw-px-4 tw-max-w-4xl">
        <div className="tw-animate-pulse">
          <div className="tw-flex tw-justify-center tw-mb-8">
            <div className="tw-h-16 tw-w-16 tw-rounded-full tw-bg-green-100"></div>
          </div>
          <div className="tw-h-8 tw-bg-gray-200 tw-rounded tw-mb-4 tw-w-2/3 tw-mx-auto"></div>
          <div className="tw-h-4 tw-bg-gray-200 tw-rounded tw-mb-12 tw-w-1/2 tw-mx-auto"></div>

          <div className="tw-h-6 tw-bg-gray-200 tw-rounded tw-mb-4 tw-w-1/4"></div>
          <div className="tw-h-24 tw-bg-gray-200 tw-rounded tw-mb-8"></div>

          <div className="tw-h-6 tw-bg-gray-200 tw-rounded tw-mb-4 tw-w-1/4"></div>
          <div className="tw-h-24 tw-bg-gray-200 tw-rounded tw-mb-8"></div>
        </div>
      </div>
    );
  }

  // Show error message if order not found
  if (!orderDetails) {
    return (
      <div className="tw-container tw-mx-auto tw-py-16 tw-px-4 tw-text-center">
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

  // Format date for display
  const orderDate = new Date(orderDetails.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="tw-container tw-mx-auto tw-py-12 tw-px-4 tw-max-w-4xl">
      {/* Success header */}
      <div className="tw-text-center tw-mb-12">
        <div className="tw-mb-6">
          <div className="tw-h-20 tw-w-20 tw-rounded-full tw-bg-green-100 tw-flex tw-items-center tw-justify-center tw-mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-10 tw-w-10 tw-text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="tw-text-3xl tw-font-bold tw-mb-2">Thank You for Your Order!</h1>
        <p className="tw-text-lg tw-text-gray-600 tw-mb-1">
          Your order has been confirmed and is being processed.
        </p>
        <p className="tw-text-gray-500">
          Order number: <span className="tw-font-medium">{orderDetails.id}</span>
        </p>
        <p className="tw-text-gray-500">
          Date: <span className="tw-font-medium">{orderDate}</span>
        </p>
      </div>

      {/* Order details */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-overflow-hidden tw-mb-8">
        <div className="tw-p-6 tw-border-b tw-border-gray-200">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Order Details</h2>

          {/* Order items */}
          <div className="tw-space-y-6 tw-mb-6">
            {orderDetails.items.map((item) => (
              <div key={item.id} className="tw-flex tw-items-center">
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

          {/* Order total */}
          <div className="tw-pt-4 tw-border-t tw-border-gray-200">
            <div className="tw-space-y-2">
              <div className="tw-flex tw-justify-between">
                <span>Subtotal</span>
                <span>${orderDetails.subtotal?.toFixed(2) || '0.00'}</span>
              </div>

              {orderDetails.shipping_cost > 0 && (
                <div className="tw-flex tw-justify-between">
                  <span>Shipping</span>
                  <span>${orderDetails.shipping_cost.toFixed(2)}</span>
                </div>
              )}

              {orderDetails.tax_amount > 0 && (
                <div className="tw-flex tw-justify-between">
                  <span>Tax</span>
                  <span>${orderDetails.tax_amount.toFixed(2)}</span>
                </div>
              )}

              {orderDetails.coupon_discount_amount > 0 && (
                <div className="tw-flex tw-justify-between tw-text-green-600">
                  <span>Discount ({orderDetails.coupon_code})</span>
                  <span>-${orderDetails.coupon_discount_amount.toFixed(2)}</span>
                </div>
              )}

              <div className="tw-flex tw-justify-between tw-font-semibold tw-pt-2 tw-border-t tw-border-gray-200">
                <span>Total</span>
                <span className="tw-font-bold">${(orderDetails.total_amount || orderDetails.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping information */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-overflow-hidden tw-mb-8">
        <div className="tw-p-6">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Shipping Information</h2>
          <p className="tw-mb-1">
            {orderDetails.shipping_address.first_name} {orderDetails.shipping_address.last_name}
          </p>
          <p className="tw-mb-1">{orderDetails.shipping_address.address}</p>
          <p className="tw-mb-1">
            {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code}
          </p>
        </div>
      </div>

      {/* Account creation banner for guest users */}
      {orderDetails.guest_token && orderDetails.guest_email && (
        <CreateAccountBanner
          guestToken={orderDetails.guest_token}
          email={orderDetails.guest_email}
          firstName={orderDetails.shipping_address.first_name}
          lastName={orderDetails.shipping_address.last_name}
        />
      )}

      {/* Next steps */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-overflow-hidden tw-mb-8">
        <div className="tw-p-6">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">What's Next?</h2>
          <ul className="tw-list-disc tw-pl-5 tw-space-y-2 tw-text-gray-700">
            <li>You will receive an email confirmation shortly.</li>
            <li>We'll notify you when your order ships.</li>
            {orderDetails.user_id ? (
              <li>You can track your order status in your account.</li>
            ) : (
              <li>You can track your order using your email and order number.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Action buttons */}
      <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center">
        <Link href="/shop" className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-6 tw-py-3 tw-rounded-md tw-font-medium tw-text-center">
          Continue Shopping
        </Link>

        {orderDetails.user_id ? (
          <Link href="/dashboard/orders" className="tw-bg-gray-200 hover:tw-bg-gray-300 tw-text-gray-800 tw-px-6 tw-py-3 tw-rounded-md tw-font-medium tw-text-center">
            View All Orders
          </Link>
        ) : (
          <Link
            href={`/order/${orderDetails.id}?email=${encodeURIComponent(orderDetails.guest_email || '')}`}
            className="tw-bg-gray-200 hover:tw-bg-gray-300 tw-text-gray-800 tw-px-6 tw-py-3 tw-rounded-md tw-font-medium tw-text-center"
          >
            View Order Details
          </Link>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="tw-container tw-mx-auto tw-py-16 tw-px-4 tw-max-w-4xl">
        <div className="tw-animate-pulse">
          <div className="tw-flex tw-justify-center tw-mb-8">
            <div className="tw-h-16 tw-w-16 tw-rounded-full tw-bg-green-100"></div>
          </div>
          <div className="tw-h-8 tw-bg-gray-200 tw-rounded tw-mb-4 tw-w-2/3 tw-mx-auto"></div>
          <div className="tw-h-4 tw-bg-gray-200 tw-rounded tw-mb-12 tw-w-1/2 tw-mx-auto"></div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}