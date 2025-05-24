'use client';

import React, { useState, useEffect } from 'react';
import { shippingService } from '@/services/shippingService';
import { CartItem } from '@/services/cartService';

interface FreeShippingProgressProps {
  subtotal: number;
  cartItems: CartItem[];
  countryCode?: string;
}

const FreeShippingProgress: React.FC<FreeShippingProgressProps> = ({
  subtotal,
  cartItems,
  countryCode = 'US'
}) => {
  const [loading, setLoading] = useState(true);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [remainingForFreeShipping, setRemainingForFreeShipping] = useState(0);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    async function checkFreeShipping() {
      try {
        setLoading(true);
        
        // Get free shipping threshold
        const threshold = await shippingService.getFreeShippingThreshold(countryCode);
        setFreeShippingThreshold(threshold);
        
        // Check if eligible for free shipping
        const eligible = await shippingService.isEligibleForFreeShipping(
          subtotal,
          cartItems,
          { country: countryCode }
        );
        setIsEligible(eligible);
        
        // Get remaining amount for free shipping
        const remaining = await shippingService.getRemainingForFreeShipping(
          subtotal,
          countryCode,
          cartItems
        );
        setRemainingForFreeShipping(remaining);
      } catch (error) {
        console.error('Error checking free shipping:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkFreeShipping();
  }, [subtotal, cartItems, countryCode]);
  
  // Calculate progress percentage
  const progressPercentage = freeShippingThreshold > 0
    ? Math.min(100, ((freeShippingThreshold - remainingForFreeShipping) / freeShippingThreshold) * 100)
    : 0;
  
  if (loading) {
    return (
      <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md tw-animate-pulse">
        <div className="tw-h-4 tw-bg-gray-200 tw-rounded tw-w-3/4"></div>
        <div className="tw-h-2 tw-bg-gray-200 tw-rounded tw-mt-2 tw-w-full"></div>
      </div>
    );
  }
  
  if (isEligible) {
    return (
      <div className="tw-bg-green-50 tw-p-4 tw-rounded-md tw-border tw-border-green-100">
        <p className="tw-text-green-700 tw-font-medium">
          🎉 Your order qualifies for FREE standard shipping!
        </p>
      </div>
    );
  }
  
  if (remainingForFreeShipping === 0 || freeShippingThreshold === 0) {
    return null;
  }
  
  return (
    <div className="tw-bg-blue-50 tw-p-4 tw-rounded-md tw-border tw-border-blue-100">
      <p className="tw-text-blue-700">
        Add <span className="tw-font-medium">${remainingForFreeShipping.toFixed(2)}</span> more to qualify for FREE standard shipping!
      </p>
      
      <div className="tw-mt-2">
        <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2.5">
          <div 
            className="tw-bg-blue-600 tw-h-2.5 tw-rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="tw-flex tw-justify-between tw-mt-1 tw-text-xs tw-text-gray-500">
          <span>$0</span>
          <span>${freeShippingThreshold.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default FreeShippingProgress;
