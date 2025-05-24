'use client';

import React, { useState } from 'react';
import { ShippingAddress } from '@/services/shippingService';

interface AddressValidatorProps {
  address: ShippingAddress;
  onValidAddress: (validatedAddress: ShippingAddress) => void;
}

const AddressValidator: React.FC<AddressValidatorProps> = ({
  address,
  onValidAddress
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedAddress, setSuggestedAddress] = useState<ShippingAddress | null>(null);

  const validateAddress = async () => {
    // Only validate if we have the minimum required fields
    if (!address.address || !address.city || !address.state || !address.postalCode || !address.country) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shipping/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate address');
      }

      if (data.isValid) {
        // Check if the validated address is different from the original
        const isDifferent = 
          data.address.address !== address.address ||
          data.address.city !== address.city ||
          data.address.state !== address.state ||
          data.address.postalCode !== address.postalCode;

        if (isDifferent) {
          setSuggestedAddress(data.address);
        } else {
          // Address is valid and unchanged
          onValidAddress(address);
        }
      } else {
        setError('The address could not be validated. Please check and try again.');
      }
    } catch (error) {
      console.error('Error validating address:', error);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const acceptSuggestion = () => {
    if (suggestedAddress) {
      onValidAddress(suggestedAddress);
      setSuggestedAddress(null);
    }
  };

  const keepOriginal = () => {
    onValidAddress(address);
    setSuggestedAddress(null);
  };

  return (
    <div>
      {/* Validation button */}
      {!suggestedAddress && (
        <button
          type="button"
          className="tw-text-blue-600 tw-text-sm tw-underline tw-mt-2"
          onClick={validateAddress}
          disabled={loading}
        >
          {loading ? 'Validating...' : 'Validate address'}
        </button>
      )}

      {/* Error message */}
      {error && (
        <div className="tw-bg-red-50 tw-p-3 tw-rounded tw-mt-3">
          <p className="tw-text-red-600 tw-text-sm">{error}</p>
        </div>
      )}

      {/* Address suggestion */}
      {suggestedAddress && (
        <div className="tw-bg-yellow-50 tw-p-4 tw-rounded tw-mt-3">
          <h4 className="tw-font-medium tw-text-yellow-800">Suggested Address</h4>
          <p className="tw-text-sm tw-text-yellow-700 tw-mt-1">
            We found a more accurate address. Would you like to use it?
          </p>
          
          <div className="tw-mt-2 tw-text-sm">
            <p>{suggestedAddress.name}</p>
            <p>{suggestedAddress.address}</p>
            {suggestedAddress.address2 && <p>{suggestedAddress.address2}</p>}
            <p>
              {suggestedAddress.city}, {suggestedAddress.state} {suggestedAddress.postalCode}
            </p>
            <p>{suggestedAddress.country}</p>
          </div>
          
          <div className="tw-mt-3 tw-flex tw-space-x-3">
            <button
              type="button"
              className="tw-bg-yellow-600 tw-text-white tw-px-3 tw-py-1 tw-rounded tw-text-sm"
              onClick={acceptSuggestion}
            >
              Use suggested address
            </button>
            <button
              type="button"
              className="tw-bg-gray-200 tw-text-gray-800 tw-px-3 tw-py-1 tw-rounded tw-text-sm"
              onClick={keepOriginal}
            >
              Keep my address
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressValidator;
