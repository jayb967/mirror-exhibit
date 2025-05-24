'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShippingOption, ShippingAddress } from '@/services/shippingService';
import { CartItem } from '@/services/cartService';

interface ShippingOptionsProps {
  address: ShippingAddress;
  cartItems: CartItem[];
  selectedOption: string;
  onSelectOption: (optionId: string) => void;
}

const ShippingOptions: React.FC<ShippingOptionsProps> = ({
  address,
  cartItems,
  selectedOption,
  onSelectOption
}) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [freeShippingEligible, setFreeShippingEligible] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [remainingForFreeShipping, setRemainingForFreeShipping] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch shipping options if we have a valid address
    if (address && address.country && address.postalCode) {
      fetchShippingOptions();
    } else {
      setLoading(false);
      setOptions([]);
    }
  }, [address, cartItems]);

  const fetchShippingOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          cartItems
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch shipping options');
      }

      const data = await response.json();

      setOptions(data.options);
      setFreeShippingEligible(data.freeShippingEligible);
      setFreeShippingThreshold(data.freeShippingThreshold);
      setRemainingForFreeShipping(data.remainingForFreeShipping);

      // If no option is selected yet, select the first one
      if (!selectedOption && data.options.length > 0) {
        onSelectOption(data.options[0].id);
      }

      // If selected option is not in the list, select the first one
      if (selectedOption && !data.options.find((option: ShippingOption) => option.id === selectedOption)) {
        onSelectOption(data.options[0].id);
      }
    } catch (error) {
      console.error('Error fetching shipping options:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Format price with free shipping if eligible
  const formatPrice = (option: ShippingOption) => {
    if (freeShippingEligible && option.service_type === 'standard') {
      return (
        <span className="tw-flex tw-items-center">
          <span className="tw-line-through tw-text-gray-400 tw-mr-2">${option.price.toFixed(2)}</span>
          <span className="tw-text-green-600 tw-font-semibold">FREE</span>
        </span>
      );
    }
    return `$${option.price.toFixed(2)}`;
  };

  return (
    <div className="tw-mt-4">
      <h3 className="tw-text-lg tw-font-semibold tw-mb-2">Shipping Options</h3>

      {loading ? (
        <div className="tw-flex tw-justify-center tw-py-4">
          <div className="tw-animate-spin tw-rounded-full tw-h-6 tw-w-6 tw-border-b-2 tw-border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="tw-bg-red-50 tw-p-4 tw-rounded tw-mb-4">
          <p className="tw-text-red-600">{error}</p>
          <p className="tw-text-sm tw-mt-1">Please check your address and try again.</p>
        </div>
      ) : options.length === 0 ? (
        <div className="tw-bg-yellow-50 tw-p-4 tw-rounded tw-mb-4">
          <p className="tw-text-yellow-700">Please enter a valid shipping address to see shipping options.</p>
        </div>
      ) : (
        <>
          {/* Free shipping progress */}
          {!freeShippingEligible && remainingForFreeShipping > 0 && (
            <div className="tw-bg-blue-50 tw-p-3 tw-rounded tw-mb-4">
              <p className="tw-text-blue-700 tw-text-sm">
                Add ${remainingForFreeShipping.toFixed(2)} more to qualify for free standard shipping!
              </p>
              <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2.5 tw-mt-2">
                <div
                  className="tw-bg-blue-600 tw-h-2.5 tw-rounded-full"
                  style={{
                    width: `${Math.min(100, ((freeShippingThreshold - remainingForFreeShipping) / freeShippingThreshold) * 100)}%`
                  }}
                ></div>
              </div>
              <div className="tw-flex tw-justify-between tw-mt-1 tw-text-xs tw-text-gray-500">
                <span>$0</span>
                <span>${freeShippingThreshold.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Show success message when eligible */}
          {freeShippingEligible && (
            <div className="tw-bg-green-50 tw-p-3 tw-rounded tw-mb-4">
              <p className="tw-text-green-700 tw-text-sm tw-flex tw-items-center">
                <span className="tw-mr-1">🎉</span>
                Your order qualifies for FREE standard shipping!
              </p>
            </div>
          )}

          {/* Shipping options */}
          <div className="tw-space-y-3">
            {options.map((option) => (
              <div
                key={option.id}
                className={`tw-border tw-rounded-md tw-p-3 tw-cursor-pointer tw-transition-colors ${
                  selectedOption === option.id
                    ? 'tw-border-blue-500 tw-bg-blue-50'
                    : 'tw-border-gray-200 hover:tw-border-gray-300'
                }`}
                onClick={() => onSelectOption(option.id)}
              >
                <div className="tw-flex tw-flex-col sm:tw-flex-row tw-items-start sm:tw-items-center tw-justify-between">
                  <div className="tw-flex tw-items-center tw-w-full sm:tw-w-auto">
                    <input
                      type="radio"
                      id={`shipping-${option.id}`}
                      name="shipping-option"
                      checked={selectedOption === option.id}
                      onChange={() => onSelectOption(option.id)}
                      className="tw-mr-3 tw-h-5 tw-w-5 tw-flex-shrink-0"
                    />
                    <div className="tw-flex-1">
                      <label
                        htmlFor={`shipping-${option.id}`}
                        className="tw-font-medium tw-cursor-pointer tw-text-sm sm:tw-text-base tw-whitespace-normal"
                      >
                        {option.name}
                      </label>
                      <p className="tw-text-xs sm:tw-text-sm tw-text-gray-500 tw-whitespace-normal">{option.description}</p>
                    </div>
                  </div>
                  <div className="tw-text-right tw-mt-2 sm:tw-mt-0 tw-ml-8 sm:tw-ml-0">
                    <div className="tw-font-medium tw-text-sm sm:tw-text-base">{formatPrice(option)}</div>
                  </div>
                </div>

                {/* Courier logo if available */}
                {option.courier_logo && (
                  <div className="tw-mt-2 tw-pl-6 sm:tw-pl-8">
                    <Image
                      src={option.courier_logo}
                      alt={option.courier_name || option.name}
                      width={80}
                      height={30}
                      className="tw-object-contain tw-h-6 sm:tw-h-8 tw-w-auto"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ShippingOptions;
