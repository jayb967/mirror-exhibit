'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ShippingAddress } from '@/services/shippingService';

interface SavedAddressesProps {
  onSelectAddress: (address: ShippingAddress) => void;
  onAddNewAddress: () => void;
}

interface DbAddress {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
  onSelectAddress,
  onAddNewAddress
}) => {
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setAddresses([]);
        return;
      }

      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAddresses(data || []);

      // Select default address if available
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        handleSelectAddress(defaultAddress);
      } else if (data && data.length > 0) {
        setSelectedAddressId(data[0].id);
        handleSelectAddress(data[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: DbAddress) => {
    setSelectedAddressId(address.id);

    // Convert to ShippingAddress format
    const shippingAddress: ShippingAddress = {
      name: `${address.first_name} ${address.last_name}`,
      address: address.address,
      address2: address.apartment || undefined,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: address.phone
    };

    onSelectAddress(shippingAddress);
  };

  const setAsDefault = async (addressId: string) => {
    try {
      // First, set all addresses to non-default
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', (await supabase.auth.getSession()).data.session?.user.id);

      // Then set the selected address as default
      await supabase
        .from('shipping_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      // Refresh the list
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Failed to set default address');
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      await supabase
        .from('shipping_addresses')
        .delete()
        .eq('id', addressId);

      // Refresh the list
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Failed to delete address');
    }
  };

  if (loading) {
    return (
      <div className="tw-flex tw-justify-center tw-py-4">
        <div className="tw-animate-spin tw-rounded-full tw-h-6 tw-w-6 tw-border-b-2 tw-border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-bg-red-50 tw-p-4 tw-rounded tw-mb-4">
        <p className="tw-text-red-600">{error}</p>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="tw-bg-gray-50 tw-p-4 tw-rounded tw-mb-4">
        <p className="tw-text-gray-700">You don't have any saved addresses.</p>
        <button
          type="button"
          className="tw-mt-2 tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded tw-text-sm"
          onClick={onAddNewAddress}
        >
          Add a new address
        </button>
      </div>
    );
  }

  return (
    <div className="tw-space-y-4">
      <h3 className="tw-text-lg tw-font-semibold">Your Addresses</h3>

      <div className="tw-space-y-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`tw-border tw-rounded-md tw-p-3 tw-cursor-pointer tw-transition-colors ${
              selectedAddressId === address.id
                ? 'tw-border-blue-500 tw-bg-blue-50'
                : 'tw-border-gray-200 hover:tw-border-gray-300'
            }`}
            onClick={() => handleSelectAddress(address)}
          >
            <div className="tw-flex tw-items-start">
              <input
                type="radio"
                id={`address-${address.id}`}
                name="shipping-address"
                checked={selectedAddressId === address.id}
                onChange={() => handleSelectAddress(address)}
                className="tw-mt-1 tw-mr-3 tw-h-5 tw-w-5 tw-flex-shrink-0"
              />
              <div className="tw-flex-1">
                <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between">
                  <label
                    htmlFor={`address-${address.id}`}
                    className="tw-font-medium tw-cursor-pointer tw-text-sm sm:tw-text-base tw-whitespace-normal"
                  >
                    {address.first_name} {address.last_name}
                    {address.is_default && (
                      <span className="tw-ml-2 tw-bg-blue-100 tw-text-blue-800 tw-text-xs tw-px-2 tw-py-0.5 tw-rounded">
                        Default
                      </span>
                    )}
                  </label>
                  <div className="tw-flex tw-space-x-2 tw-mt-2 sm:tw-mt-0">
                    {!address.is_default && (
                      <button
                        type="button"
                        className="tw-text-blue-600 tw-text-xs sm:tw-text-sm tw-whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAsDefault(address.id);
                        }}
                      >
                        Set as default
                      </button>
                    )}
                    <button
                      type="button"
                      className="tw-text-red-600 tw-text-xs sm:tw-text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAddress(address.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="tw-text-xs sm:tw-text-sm tw-text-gray-500 tw-mt-1">{address.address}</p>
                {address.apartment && (
                  <p className="tw-text-xs sm:tw-text-sm tw-text-gray-500">{address.apartment}</p>
                )}
                <p className="tw-text-xs sm:tw-text-sm tw-text-gray-500">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="tw-text-xs sm:tw-text-sm tw-text-gray-500">{address.country}</p>
                <p className="tw-text-xs sm:tw-text-sm tw-text-gray-500 tw-mt-1">{address.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="tw-text-blue-600 tw-underline tw-text-sm"
        onClick={onAddNewAddress}
      >
        + Add a new address
      </button>
    </div>
  );
};

export default SavedAddresses;
