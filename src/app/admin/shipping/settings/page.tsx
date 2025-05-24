'use client';


// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/utils/supabase-client';
import { toast } from 'react-toastify';

interface ShippingSettings {
  store_address: {
    line_1: string;
    line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country_alpha2: string;
    contact_name: string;
    phone_number: string;
  };
  default_package: {
    weight: number;
    weight_unit: 'kg' | 'lb';
    length: number;
    width: number;
    height: number;
    dimension_unit: 'cm' | 'in';
  };
  free_shipping_threshold: number;
  use_easyship: boolean;
}

const ShippingSettingsPage = () => {
  const [settings, setSettings] = useState<ShippingSettings>({
    store_address: {
      line_1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country_alpha2: 'US',
      contact_name: 'Mirror Exhibit',
      phone_number: '555-123-4567'
    },
    default_package: {
      weight: 2,
      weight_unit: 'lb',
      length: 12,
      width: 12,
      height: 4,
      dimension_unit: 'in'
    },
    free_shipping_threshold: 100,
    use_easyship: true
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const supabase = useSupabaseClient();

  useEffect(() => {
    // In a real implementation, we would fetch the settings from the database
    // For now, we'll just use the default values
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // In a real implementation, we would save the settings to the database
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Shipping settings saved successfully');
    } catch (error) {
      console.error('Error saving shipping settings:', error);
      toast.error('Failed to save shipping settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      store_address: {
        ...prev.store_address,
        [name]: value
      }
    }));
  };

  const handlePackageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      default_package: {
        ...prev.default_package,
        [name]: name === 'weight_unit' || name === 'dimension_unit' ? value : parseFloat(value)
      }
    }));
  };

  if (loading) {
    return (
      <div className="tw-flex tw-justify-center tw-py-8">
        <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
      <h1 className="tw-text-2xl tw-font-bold tw-mb-6">Shipping Settings</h1>

      <form onSubmit={handleSubmit} className="tw-space-y-8">
        {/* Store Address */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Store Address</h2>
          <p className="tw-text-gray-600 tw-mb-4">
            This address will be used as the origin address for shipping calculations.
          </p>

          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Contact Name</label>
              <input
                type="text"
                name="contact_name"
                value={settings.store_address.contact_name}
                onChange={handleAddressChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={settings.store_address.phone_number}
                onChange={handleAddressChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              />
            </div>

            <div className="md:tw-col-span-2">
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Address Line 1</label>
              <input
                type="text"
                name="line_1"
                value={settings.store_address.line_1}
                onChange={handleAddressChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              />
            </div>

            <div className="md:tw-col-span-2">
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Address Line 2</label>
              <input
                type="text"
                name="line_2"
                value={settings.store_address.line_2 || ''}
                onChange={handleAddressChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">City</label>
              <input
                type="text"
                name="city"
                value={settings.store_address.city}
                onChange={handleAddressChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">State/Province</label>
              <input
                type="text"
                name="state"
                value={settings.store_address.state}
                onChange={handleAddressChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={settings.store_address.postal_code}
                onChange={handleAddressChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Country</label>
              <select
                name="country_alpha2"
                value={settings.store_address.country_alpha2}
                onChange={handleAddressChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Default Package */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Default Package</h2>
          <p className="tw-text-gray-600 tw-mb-4">
            These dimensions will be used when product-specific dimensions are not available.
          </p>

          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Weight</label>
              <div className="tw-flex">
                <input
                  type="number"
                  name="weight"
                  value={settings.default_package.weight}
                  onChange={handlePackageChange}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded-l tw-px-3 tw-py-2"
                  min="0.1"
                  step="0.1"
                  required
                />
                <select
                  name="weight_unit"
                  value={settings.default_package.weight_unit}
                  onChange={handlePackageChange}
                  className="tw-border tw-border-gray-300 tw-rounded-r tw-px-3 tw-py-2 tw-bg-gray-50"
                >
                  <option value="lb">lb</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Length</label>
              <input
                type="number"
                name="length"
                value={settings.default_package.length}
                onChange={handlePackageChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                min="1"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Width</label>
              <input
                type="number"
                name="width"
                value={settings.default_package.width}
                onChange={handlePackageChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                min="1"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Height</label>
              <input
                type="number"
                name="height"
                value={settings.default_package.height}
                onChange={handlePackageChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                min="1"
                step="0.1"
                required
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Dimension Unit</label>
              <select
                name="dimension_unit"
                value={settings.default_package.dimension_unit}
                onChange={handlePackageChange}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
              >
                <option value="in">inches</option>
                <option value="cm">centimeters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping Options */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Shipping Options</h2>

          <div className="tw-space-y-4">
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  free_shipping_threshold: parseFloat(e.target.value)
                }))}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                min="0"
                step="0.01"
                required
              />
              <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                Orders above this amount will qualify for free standard shipping.
              </p>
            </div>

            <div className="tw-flex tw-items-center">
              <input
                type="checkbox"
                id="use_easyship"
                checked={settings.use_easyship}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  use_easyship: e.target.checked
                }))}
                className="tw-mr-2"
              />
              <label htmlFor="use_easyship" className="tw-text-sm tw-font-medium">
                Use Easyship for shipping rates and label generation
              </label>
            </div>
          </div>
        </div>

        <div className="tw-flex tw-justify-end">
          <button
            type="submit"
            className="tw-bg-blue-600 tw-text-white tw-px-6 tw-py-2 tw-rounded tw-font-medium hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-ring-offset-2 disabled:tw-opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingSettingsPage;
