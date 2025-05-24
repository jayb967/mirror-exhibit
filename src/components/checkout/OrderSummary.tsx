'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem } from '@/services/cartService';
import { Coupon } from '@/services/couponService';

interface OrderSummaryProps {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  appliedCoupon?: Coupon | null;
  showDetails?: boolean;
  className?: string;
}

/**
 * Order Summary Component
 * Displays a summary of the order with items, prices, and totals
 */
const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  subtotal,
  tax,
  shipping,
  discount = 0,
  appliedCoupon = null,
  showDetails = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate total
  const total = subtotal + tax + shipping - discount;

  // Calculate item count
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className={`tw-bg-white tw-rounded-lg tw-shadow-sm tw-overflow-hidden ${className}`}>
      <div className="tw-p-6 tw-border-b tw-border-gray-200">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <h2 className="tw-text-xl tw-font-semibold">Order Summary</h2>
          {cartItems.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="tw-text-blue-600 hover:tw-text-blue-800 tw-text-sm tw-flex tw-items-center"
            >
              {isExpanded ? 'Hide details' : 'Show details'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`tw-h-4 tw-w-4 tw-ml-1 tw-transition-transform ${isExpanded ? 'tw-rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Cart Items */}
        {showDetails && isExpanded && cartItems.length > 0 && (
          <div className="tw-space-y-4 tw-mb-6">
            {cartItems.map((item, index) => (
              <div key={item.id || `${item.product_id}-${index}`} className="tw-flex tw-items-center">
                <div className="tw-relative tw-h-16 tw-w-16 tw-mr-4 tw-flex-shrink-0">
                  <Image
                    src={item.image || item.product?.image_url || item.product?.image || '/assets/img/logo/ME_Logo.png'}
                    alt={item.title || item.product?.name || item.product?.title || 'Product'}
                    width={64}
                    height={64}
                    style={{ objectFit: 'cover' }}
                    className="tw-rounded-md"
                  />
                  <span className="tw-absolute tw-top-0 tw-right-0 tw-bg-gray-700 tw-text-white tw-rounded-full tw-w-5 tw-h-5 tw-flex tw-items-center tw-justify-center tw-text-xs">
                    {item.quantity}
                  </span>
                </div>
                <div className="tw-flex-1">
                  <h3 className="tw-text-sm tw-font-medium tw-text-gray-900">
                    {item.title || item.product?.name || item.product?.title || 'Product'}
                  </h3>
                  {/* Show product variations if available */}
                  {(item.size_name || item.frame_name) && (
                    <p className="tw-text-xs tw-text-gray-500 tw-mb-1">
                      {[
                        item.size_name ? `Size: ${item.size_name}` : '',
                        item.frame_name ? `Frame: ${item.frame_name}` : ''
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p className="tw-text-sm tw-text-gray-500">
                    ${(item.price || item.product?.price || 0).toFixed(2)} each
                  </p>
                </div>
                <div className="tw-font-bold tw-text-gray-900">
                  ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        <div className="tw-space-y-2">
          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-600">
              Subtotal {!isExpanded && itemCount > 0 && `(${itemCount} item${itemCount !== 1 ? 's' : ''})`}
            </span>
            <span className="tw-font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-600">Shipping</span>
            <span className="tw-font-medium">
              {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
            </span>
          </div>

          <div className="tw-flex tw-justify-between">
            <span className="tw-text-gray-600">Tax</span>
            <span className="tw-font-medium">${tax.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="tw-flex tw-justify-between tw-text-green-600">
              <span className="tw-flex tw-flex-col">
                <span>Discount</span>
                {appliedCoupon && (
                  <span className="tw-text-xs tw-text-gray-500">
                    Coupon: {appliedCoupon.code}
                    {appliedCoupon.discount_type === 'percentage'
                      ? ` (${appliedCoupon.discount_value}% off)`
                      : ` ($${appliedCoupon.discount_value.toFixed(2)} off)`}
                  </span>
                )}
              </span>
              <span className="tw-font-medium">-${discount.toFixed(2)}</span>
            </div>
          )}

          <div className="tw-flex tw-justify-between tw-pt-4 tw-border-t tw-border-gray-200 tw-mt-4">
            <span className="tw-font-semibold">Total</span>
            <span className="tw-font-bold tw-text-xl">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Secure checkout message */}
      <div className="tw-bg-gray-50 tw-px-6 tw-py-4">
        <div className="tw-flex tw-items-center tw-space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="tw-h-5 tw-w-5 tw-text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="tw-text-sm tw-text-gray-700">Secure checkout</span>
        </div>

        {/* Payment methods */}
        <div className="tw-mt-3">
          <p className="tw-text-xs tw-text-gray-500 tw-mb-1">We accept:</p>
          <div className="tw-flex tw-space-x-2">
            <span className="tw-px-2 tw-py-1 tw-bg-gray-100 tw-rounded tw-text-xs">Visa</span>
            <span className="tw-px-2 tw-py-1 tw-bg-gray-100 tw-rounded tw-text-xs">Mastercard</span>
            <span className="tw-px-2 tw-py-1 tw-bg-gray-100 tw-rounded tw-text-xs">PayPal</span>
            <span className="tw-px-2 tw-py-1 tw-bg-gray-100 tw-rounded tw-text-xs">Apple Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
