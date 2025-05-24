'use client';

import React, { useState, useEffect } from 'react';
import { Coupon, couponService } from '@/services/couponService';
import { useSelector } from 'react-redux';
import { shippingService, ShippingAddress } from '@/services/shippingService';

interface CouponFormProps {
  subtotal: number;
  onApplyCoupon: (coupon: Coupon, discount: number) => void;
  onRemoveCoupon: () => void;
  appliedCoupon?: Coupon;
  shippingAddress?: ShippingAddress;
  showFreeShippingWarning?: boolean;
}

const CouponForm: React.FC<CouponFormProps> = ({
  subtotal,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  shippingAddress,
  showFreeShippingWarning = false
}) => {
  // Redux cart data
  const cartItems = useSelector((state: any) => state.cart.cart);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFreeShippingEligible, setIsFreeShippingEligible] = useState(false);

  // Check free shipping eligibility when subtotal or cart items change
  useEffect(() => {
    const checkFreeShipping = async () => {
      if (shippingAddress && cartItems.length > 0) {
        const isEligible = await shippingService.isEligibleForFreeShipping(
          subtotal,
          cartItems,
          shippingAddress
        );
        setIsFreeShippingEligible(isEligible);
      }
    };

    checkFreeShipping();
  }, [subtotal, cartItems, shippingAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Check if free shipping is already applied
      if (isFreeShippingEligible && showFreeShippingWarning) {
        // First check if this coupon is compatible with free shipping
        const preCheck = await couponService.validateCoupon(
          couponCode,
          subtotal,
          cartItems,
          shippingAddress
        );

        if (!preCheck.isValid && preCheck.error?.includes('free shipping')) {
          setError(preCheck.error);
          return;
        }
      }

      // Use API for validation to ensure server-side rules are applied
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
          hasCartItems: cartItems.length > 0,
          hasShippingAddress: !!shippingAddress,
          isFreeShippingEligible
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error validating coupon');
      }

      if (!data.isValid) {
        setError(data.error || 'Invalid coupon code');
        return;
      }

      // Coupon is valid
      setSuccess(`Coupon applied: ${formatDiscount(data.coupon)}`);
      setCouponCode('');
      onApplyCoupon(data.coupon, data.discount);
    } catch (error) {
      console.error('Error applying coupon:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCouponCode('');
    setError(null);
    setSuccess(null);
    onRemoveCoupon();
  };

  const formatDiscount = (coupon: Coupon): string => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% off`;
    } else {
      return `$${coupon.discount_value.toFixed(2)} off`;
    }
  };

  return (
    <div className="tw-mt-4">
      <h3 className="tw-text-lg tw-font-semibold tw-mb-2">Discount Code</h3>

      {appliedCoupon ? (
        <div className="tw-bg-green-50 tw-p-3 tw-rounded tw-mb-4">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center">
            <div>
              <p className="tw-text-green-700 tw-font-medium tw-text-sm sm:tw-text-base">{appliedCoupon.code}</p>
              <p className="tw-text-green-600 tw-text-xs sm:tw-text-sm">{formatDiscount(appliedCoupon)}</p>
              {appliedCoupon.description && (
                <p className="tw-text-gray-600 tw-text-xs tw-mt-1 tw-whitespace-normal">{appliedCoupon.description}</p>
              )}
              {appliedCoupon.compatible_with_free_shipping === false && (
                <p className="tw-text-orange-600 tw-text-xs tw-mt-1">
                  Note: This coupon cannot be combined with free shipping
                </p>
              )}
            </div>
            <button
              type="button"
              className="tw-text-red-600 tw-text-xs sm:tw-text-sm tw-underline tw-mt-2 sm:tw-mt-0"
              onClick={handleRemove}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="tw-flex tw-flex-col tw-space-y-3">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-space-y-2 sm:tw-space-y-0 sm:tw-space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="tw-w-full sm:tw-flex-1 tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2 tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              className="tw-w-full sm:tw-w-auto tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded tw-text-sm tw-font-medium hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-ring-offset-2 disabled:tw-opacity-50"
              disabled={loading}
            >
              {loading ? 'Applying...' : 'Apply'}
            </button>
          </div>

          {error && (
            <div className="tw-text-red-600 tw-text-sm">{error}</div>
          )}

          {success && (
            <div className="tw-text-green-600 tw-text-sm">{success}</div>
          )}

          {/* Free shipping warning */}
          {isFreeShippingEligible && showFreeShippingWarning && !appliedCoupon && (
            <div className="tw-bg-blue-50 tw-p-3 tw-rounded tw-mt-3">
              <p className="tw-text-blue-700 tw-text-xs">
                Your order is eligible for free shipping. Some coupons may not be compatible with free shipping.
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default CouponForm;
