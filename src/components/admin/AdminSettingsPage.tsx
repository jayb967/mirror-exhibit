'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import { FaSave, FaCog, FaShippingFast, FaMoneyBillWave, FaStore } from 'react-icons/fa';

interface SiteSettings {
  id?: string;
  free_shipping_threshold: number;
  origin_address: {
    name: string;
    company: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };
  tax_rate: number;
  tax_enabled: boolean;
  store_name: string;
  store_email: string;
  store_phone: string;
  easyship_enabled: boolean;
  default_package_weight: number;
  default_package_weight_unit: string;
  default_package_length: number;
  default_package_width: number;
  default_package_height: number;
  default_package_dimension_unit: string;
  stripe_enabled: boolean;
  paypal_enabled: boolean;
  apple_pay_enabled: boolean;
  google_pay_enabled: boolean;
  order_notification_email: string;
  low_stock_threshold: number;
}

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    free_shipping_threshold: 100,
    origin_address: {
      name: 'Mirror Exhibit',
      company: 'Mirror Exhibit',
      address: '123 Main St',
      address2: '',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      phone: '555-123-4567',
      email: 'orders@mirrorexhibit.com'
    },
    tax_rate: 0.0875,
    tax_enabled: true,
    store_name: 'Mirror Exhibit',
    store_email: 'admin@mirrorexhibit.com',
    store_phone: '555-123-4567',
    easyship_enabled: true,
    default_package_weight: 2.0,
    default_package_weight_unit: 'lb',
    default_package_length: 12.0,
    default_package_width: 12.0,
    default_package_height: 4.0,
    default_package_dimension_unit: 'in',
    stripe_enabled: true,
    paypal_enabled: false,
    apple_pay_enabled: false,
    google_pay_enabled: false,
    order_notification_email: 'admin@mirrorexhibit.com',
    low_stock_threshold: 5
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('shipping');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          ...settings,
          ...data,
          origin_address: data.origin_address || settings.origin_address
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(settings, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateOriginAddress = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      origin_address: {
        ...prev.origin_address,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaCog className="mr-3" />
              Site Settings
            </h1>
            <p className="text-gray-600 mt-2">Configure your store settings and preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 px-6">
            {[
              { id: 'shipping', label: 'Shipping & Origin', icon: FaShippingFast },
              { id: 'payments', label: 'Payments & Tax', icon: FaMoneyBillWave },
              { id: 'store', label: 'Store Info', icon: FaStore }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Shipping & Origin Tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Shipping Threshold ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.free_shipping_threshold}
                      onChange={(e) => updateSetting('free_shipping_threshold', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.easyship_enabled}
                        onChange={(e) => updateSetting('easyship_enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Easyship Integration</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Origin Address (For Shipping Calculations)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={settings.origin_address.company}
                      onChange={(e) => updateOriginAddress('company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={settings.origin_address.name}
                      onChange={(e) => updateOriginAddress('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={settings.origin_address.address}
                      onChange={(e) => updateOriginAddress('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={settings.origin_address.city}
                      onChange={(e) => updateOriginAddress('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={settings.origin_address.state}
                      onChange={(e) => updateOriginAddress('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={settings.origin_address.postalCode}
                      onChange={(e) => updateOriginAddress('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={settings.origin_address.country}
                      onChange={(e) => updateOriginAddress('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={settings.origin_address.phone}
                      onChange={(e) => updateOriginAddress('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={settings.origin_address.email}
                      onChange={(e) => updateOriginAddress('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments & Tax Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tax Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        checked={settings.tax_enabled}
                        onChange={(e) => updateSetting('tax_enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Tax Calculation</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={settings.tax_rate ? (settings.tax_rate * 100).toString() : ''}
                      onChange={(e) => {
                        const percentageValue = e.target.value;
                        if (percentageValue === '') {
                          updateSetting('tax_rate', 0);
                        } else {
                          const decimalValue = parseFloat(percentageValue) / 100;
                          updateSetting('tax_rate', decimalValue);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={!settings.tax_enabled}
                      placeholder="8.75"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter as percentage (e.g., 8.75 for 8.75%)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.stripe_enabled}
                        onChange={(e) => updateSetting('stripe_enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Stripe (Credit Cards)</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.paypal_enabled}
                        onChange={(e) => updateSetting('paypal_enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable PayPal</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.apple_pay_enabled}
                        onChange={(e) => updateSetting('apple_pay_enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Apple Pay</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.google_pay_enabled}
                        onChange={(e) => updateSetting('google_pay_enabled', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Google Pay</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Store Info Tab */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.store_name}
                      onChange={(e) => updateSetting('store_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Email
                    </label>
                    <input
                      type="email"
                      value={settings.store_email}
                      onChange={(e) => updateSetting('store_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Phone
                    </label>
                    <input
                      type="text"
                      value={settings.store_phone}
                      onChange={(e) => updateSetting('store_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notification Email
                    </label>
                    <input
                      type="email"
                      value={settings.order_notification_email}
                      onChange={(e) => updateSetting('order_notification_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.low_stock_threshold}
                      onChange={(e) => updateSetting('low_stock_threshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              <FaSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
