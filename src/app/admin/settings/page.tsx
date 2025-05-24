"use client";

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import { toast } from 'react-toastify';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    pinterest?: string;
  };
  shipping_options: {
    standard_shipping_fee: number;
    express_shipping_fee: number;
    free_shipping_threshold: number;
  };
  tax_rate: number;
  logo_url: string | null;
  favicon_url: string | null;
  maintenance_mode: boolean;
  [key: string]: any; // Add index signature to allow dynamic access
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    social_media: {},
    shipping_options: {
      standard_shipping_fee: 5.99,
      express_shipping_fee: 15.99,
      free_shipping_threshold: 75,
    },
    tax_rate: 0,
    logo_url: null,
    favicon_url: null,
    maintenance_mode: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parseFloat(value)
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: parseFloat(value)
      }));
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('site_settings')
        .upsert(settings, { onConflict: 'id' });

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings();
  };

  const renderGeneralSettings = () => (
    <div className="tw-space-y-6">
      <div>
        <label htmlFor="site_name" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Site Name
        </label>
        <input
          type="text"
          id="site_name"
          name="site_name"
          value={settings.site_name}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="site_description" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Site Description
        </label>
        <textarea
          id="site_description"
          name="site_description"
          rows={3}
          value={settings.site_description}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="logo_url" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Logo URL
        </label>
        <input
          type="text"
          id="logo_url"
          name="logo_url"
          value={settings.logo_url || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="favicon_url" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Favicon URL
        </label>
        <input
          type="text"
          id="favicon_url"
          name="favicon_url"
          value={settings.favicon_url || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div className="tw-flex tw-items-center">
        <input
          type="checkbox"
          id="maintenance_mode"
          name="maintenance_mode"
          checked={settings.maintenance_mode}
          onChange={handleCheckboxChange}
          className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-blue-600 focus:tw-ring-blue-500"
        />
        <label htmlFor="maintenance_mode" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
          Maintenance Mode
        </label>
      </div>
    </div>
  );

  const renderContactSettings = () => (
    <div className="tw-space-y-6">
      <div>
        <label htmlFor="contact_email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Contact Email
        </label>
        <input
          type="email"
          id="contact_email"
          name="contact_email"
          value={settings.contact_email}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="contact_phone" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Contact Phone
        </label>
        <input
          type="text"
          id="contact_phone"
          name="contact_phone"
          value={settings.contact_phone}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="address" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          value={settings.address}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>
    </div>
  );

  const renderSocialMediaSettings = () => (
    <div className="tw-space-y-6">
      <div>
        <label htmlFor="social_media.facebook" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Facebook URL
        </label>
        <input
          type="text"
          id="social_media.facebook"
          name="social_media.facebook"
          value={settings.social_media.facebook || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="social_media.instagram" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Instagram URL
        </label>
        <input
          type="text"
          id="social_media.instagram"
          name="social_media.instagram"
          value={settings.social_media.instagram || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="social_media.twitter" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Twitter URL
        </label>
        <input
          type="text"
          id="social_media.twitter"
          name="social_media.twitter"
          value={settings.social_media.twitter || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="social_media.pinterest" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Pinterest URL
        </label>
        <input
          type="text"
          id="social_media.pinterest"
          name="social_media.pinterest"
          value={settings.social_media.pinterest || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="tw-space-y-6">
      <div>
        <label htmlFor="shipping_options.standard_shipping_fee" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Standard Shipping Fee ($)
        </label>
        <input
          type="number"
          step="0.01"
          id="shipping_options.standard_shipping_fee"
          name="shipping_options.standard_shipping_fee"
          value={settings.shipping_options.standard_shipping_fee}
          onChange={handleNumberChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="shipping_options.express_shipping_fee" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Express Shipping Fee ($)
        </label>
        <input
          type="number"
          step="0.01"
          id="shipping_options.express_shipping_fee"
          name="shipping_options.express_shipping_fee"
          value={settings.shipping_options.express_shipping_fee}
          onChange={handleNumberChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="shipping_options.free_shipping_threshold" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Free Shipping Threshold ($)
        </label>
        <input
          type="number"
          step="0.01"
          id="shipping_options.free_shipping_threshold"
          name="shipping_options.free_shipping_threshold"
          value={settings.shipping_options.free_shipping_threshold}
          onChange={handleNumberChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="tax_rate" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Tax Rate (%)
        </label>
        <input
          type="number"
          step="0.01"
          id="tax_rate"
          name="tax_rate"
          value={settings.tax_rate}
          onChange={handleNumberChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>
    </div>
  );

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Site Settings</h1>

        {loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-blue-600 tw-border-t-transparent tw-rounded-full"></div>
          </div>
        ) : (
          <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden">
            <div className="tw-border-b tw-border-gray-200">
              <nav className="tw-flex tw--mb-px">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`tw-px-6 tw-py-4 tw-text-sm tw-font-medium ${
                    activeTab === 'general'
                      ? 'tw-border-b-2 tw-border-blue-500 tw-text-blue-600'
                      : 'tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`tw-px-6 tw-py-4 tw-text-sm tw-font-medium ${
                    activeTab === 'contact'
                      ? 'tw-border-b-2 tw-border-blue-500 tw-text-blue-600'
                      : 'tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  Contact
                </button>
                <button
                  onClick={() => setActiveTab('social')}
                  className={`tw-px-6 tw-py-4 tw-text-sm tw-font-medium ${
                    activeTab === 'social'
                      ? 'tw-border-b-2 tw-border-blue-500 tw-text-blue-600'
                      : 'tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  Social Media
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`tw-px-6 tw-py-4 tw-text-sm tw-font-medium ${
                    activeTab === 'shipping'
                      ? 'tw-border-b-2 tw-border-blue-500 tw-text-blue-600'
                      : 'tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  Shipping & Tax
                </button>
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="tw-p-6">
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'contact' && renderContactSettings()}
              {activeTab === 'social' && renderSocialMediaSettings()}
              {activeTab === 'shipping' && renderShippingSettings()}

              <div className="tw-mt-8 tw-flex tw-justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-shadow-sm tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500 disabled:tw-opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="tw-animate-spin tw--ml-1 tw-mr-2 tw-h-4 tw-w-4 tw-text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </SimpleAdminLayout>
  );
}