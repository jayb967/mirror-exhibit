"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-toastify";

export default function OrderCanceledPage() {
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIdParam = searchParams.get("order_id");
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function handleCanceledOrder() {
      try {
        if (!orderIdParam) {
          setLoading(false);
          return;
        }

        setOrderId(orderIdParam);

        // Verify user authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please sign in to manage your order");
          router.push("/login");
          return;
        }

        // Update order status to canceled if it exists and belongs to the user
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderIdParam)
          .eq("user_id", user.id)
          .single();

        if (orderError || !orderData) {
          console.error("Error fetching order:", orderError);
          toast.error("Could not find your order");
          return;
        }

        // Only update if the order is in pending state
        if (orderData.status === "pending") {
          await supabase
            .from("orders")
            .update({ status: "canceled" })
            .eq("id", orderIdParam)
            .eq("user_id", user.id);

          toast.info("Your order has been canceled");
        }
      } catch (error) {
        console.error("Error handling canceled order:", error);
      } finally {
        setLoading(false);
      }
    }

    handleCanceledOrder();
  }, [orderIdParam, supabase, router]);

  return (
    <div className="tw-container tw-mx-auto tw-py-16 tw-px-4 tw-max-w-4xl tw-text-center">
      <div className="tw-mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-16 tw-w-16 tw-text-orange-500 tw-mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="tw-text-3xl tw-font-bold tw-mb-4">Order Canceled</h1>
      <p className="tw-text-lg tw-text-gray-600 tw-mb-6">
        Your checkout process was canceled and no payment has been processed.
      </p>
      
      {orderId && (
        <p className="tw-text-gray-500 tw-mb-8">
          Order reference: <span className="tw-font-medium">{orderId}</span>
        </p>
      )}
      
      <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-p-6 tw-mb-10 tw-max-w-xl tw-mx-auto">
        <h2 className="tw-text-xl tw-font-semibold tw-mb-4">What happens next?</h2>
        <ul className="tw-list-disc tw-text-left tw-pl-5 tw-space-y-2 tw-text-gray-700">
          <li>Your cart items have been saved for you.</li>
          <li>You can return to your cart to complete the purchase anytime.</li>
          <li>If you encountered any issues during checkout, please contact our support team.</li>
        </ul>
      </div>
      
      <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center">
        <Link href="/cart" className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-6 tw-py-3 tw-rounded-md tw-font-medium">
          Return to Cart
        </Link>
        <Link href="/shop" className="tw-bg-gray-200 hover:tw-bg-gray-300 tw-text-gray-800 tw-px-6 tw-py-3 tw-rounded-md tw-font-medium">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
} 