'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/utils/supabase-client';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { cartService } from '@/services/cartService';

interface OneClickCheckoutProps {
  onCheckout: () => void;
  disabled?: boolean;
}

interface SavedAddress {
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
  is_default: boolean;
}

interface SavedPaymentMethod {
  id: string;
  card_brand: string;
  card_last4: string;
  is_default: boolean;
}

const OneClickCheckout: React.FC<OneClickCheckoutProps> = ({ onCheckout, disabled = false }) => {
  // Redux cart data
  const cartItems = useSelector((state: any) => state.cart.cart);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [hasOneClickSetup, setHasOneClickSetup] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<SavedAddress | null>(null);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<SavedPaymentMethod | null>(null);
  const supabase = useSupabaseClient();

  // Fetch saved addresses and payment methods
  useEffect(() => {
    const fetchSavedData = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setHasOneClickSetup(false);
          return;
        }

        // Fetch default address
        const { data: addresses, error: addressError } = await supabase
          .from('shipping_addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .limit(1)
          .single();

        if (addressError && addressError.code !== 'PGRST116') {
          console.error('Error fetching default address:', addressError);
        }

        // Fetch default payment method
        const { data: paymentMethods, error: paymentError } = await supabase
          .from('payment_methods')
          .select('id, card_brand, card_last4, is_default')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .limit(1)
          .single();

        if (paymentError && paymentError.code !== 'PGRST116') {
          console.error('Error fetching default payment method:', paymentError);
        }

        setDefaultAddress(addresses || null);
        setDefaultPaymentMethod(paymentMethods || null);

        // Check if one-click checkout is available
        setHasOneClickSetup(!!addresses && !!paymentMethods);
      } catch (error) {
        console.error('Error fetching saved data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedData();
  }, [supabase]);

  // Handle one-click checkout
  const handleOneClickCheckout = async () => {
    if (!hasOneClickSetup || !defaultAddress || !defaultPaymentMethod) {
      toast.error('One-click checkout is not set up');
      return;
    }

    try {
      setProcessing(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please sign in to use one-click checkout');
        return;
      }

      // Create order in the database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          subtotal,
          tax: subtotal * 0.1, // 10% tax rate
          shipping: 0, // Free shipping for one-click
          total: subtotal + (subtotal * 0.1),
          shipping_address: {
            first_name: defaultAddress.first_name,
            last_name: defaultAddress.last_name,
            address: defaultAddress.address,
            apartment: defaultAddress.apartment,
            city: defaultAddress.city,
            state: defaultAddress.state,
            postal_code: defaultAddress.postal_code,
            country: defaultAddress.country,
            phone: defaultAddress.phone,
            email: user.email
          },
          shipping_method: 'standard',
          payment_method: 'saved_card',
          payment_method_id: defaultPaymentMethod.id,
          is_one_click: true
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      if (!order) throw new Error('Failed to create order');

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      // Process payment with saved payment method
      const response = await fetch('/api/process-one-click-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethodId: defaultPaymentMethod.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      // Clear cart after successful checkout
      await cartService.clearCart();

      toast.success('Order placed successfully!');

      // Redirect to order confirmation
      window.location.href = `/order/success?order_id=${order.id}`;
    } catch (error) {
      console.error('Error processing one-click checkout:', error);
      toast.error('Failed to process one-click checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="tw-animate-pulse tw-h-12 tw-bg-gray-200 tw-rounded"></div>
    );
  }

  if (!hasOneClickSetup) {
    return null;
  }

  return (
    <div className="tw-mb-6">
      <button
        type="button"
        onClick={handleOneClickCheckout}
        disabled={disabled || processing || cartItems.length === 0}
        className="tw-w-full tw-bg-green-600 hover:tw-bg-green-700 tw-text-white tw-py-3 tw-px-6 tw-rounded-md tw-font-medium tw-transition-colors tw-flex tw-items-center tw-justify-center disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
      >
        {processing ? (
          <>
            <svg className="tw-animate-spin tw-h-5 tw-w-5 tw-mr-3" viewBox="0 0 24 24">
              <circle
                className="tw-opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="tw-opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="tw-h-5 tw-w-5 tw-mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            One-Click Checkout
          </>
        )}
      </button>

      <div className="tw-mt-2 tw-flex tw-items-center tw-justify-center tw-text-xs tw-text-gray-500">
        <div className="tw-flex tw-items-center">
          <span>Using saved card:</span>
          <span className="tw-ml-1 tw-font-medium">
            {defaultPaymentMethod?.card_brand} •••• {defaultPaymentMethod?.card_last4}
          </span>
        </div>
        <span className="tw-mx-2">|</span>
        <div>
          <span>Shipping to:</span>
          <span className="tw-ml-1 tw-font-medium">
            {defaultAddress?.first_name} {defaultAddress?.last_name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OneClickCheckout;
