'use client';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import { toast } from 'react-toastify';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

interface SiteSettings {
  // Store information (matches database schema)
  store_name?: string;
  store_email?: string;
  store_phone?: string;

  // Shipping settings
  free_shipping_threshold?: number;
  origin_address?: {
    name?: string;
    company?: string;
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };

  // Tax settings
  tax_rate?: number;
  tax_enabled?: boolean;

  // Social media fields
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;

  // SEO fields
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;

  // Notification settings
  order_notification_email?: string;
  low_stock_threshold?: number;

  // FAQ settings
  product_faqs?: FAQ[];
  general_faqs?: FAQ[];

  [key: string]: any; // Add index signature to allow dynamic access
}

export default function AdminSettingsRoute() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings>({
    // Store information (matches database schema)
    store_name: 'Mirror Exhibit',
    store_email: 'info@mirrorexhibit.com',
    store_phone: '555-123-4567',

    // Shipping settings
    free_shipping_threshold: 100,
    origin_address: {
      name: 'Mirror Exhibit',
      company: 'Mirror Exhibit',
      address: '3311 Cahuenga Blvd W',
      address2: '',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90068',
      country: 'US',
      phone: '555-123-4567',
      email: 'orders@mirrorexhibit.com'
    },

    // Tax settings
    tax_rate: 0.0875,
    tax_enabled: true,

    // Social media fields
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',

    // SEO fields
    meta_title: '',
    meta_description: '',
    meta_keywords: '',

    // Notification settings
    order_notification_email: 'orders@mirrorexhibit.com',
    low_stock_threshold: 5,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // FAQ management state
  const [editingFaq, setEditingFaq] = useState<{ type: 'product' | 'general'; faq: FAQ | null }>({ type: 'product', faq: null });
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<{ type: 'product' | 'general'; id: string } | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
        // Merge database data with defaults
        const mergedSettings = {
          ...settings,
          ...data,
          origin_address: data.origin_address || settings.origin_address,
        };

        setSettings(mergedSettings);
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

  const handleOriginAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      origin_address: {
        ...prev.origin_address,
        [name]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      // Only save fields that exist in the current database schema
      const dbSettings: any = {
        // Core database fields that definitely exist
        free_shipping_threshold: settings.free_shipping_threshold,
        origin_address: settings.origin_address,
        tax_rate: settings.tax_rate,
        tax_enabled: settings.tax_enabled,
        store_name: settings.store_name,
        store_email: settings.store_email,
        store_phone: settings.store_phone,
        order_notification_email: settings.order_notification_email,
        low_stock_threshold: settings.low_stock_threshold,
        meta_title: settings.meta_title,
        meta_description: settings.meta_description,
        meta_keywords: settings.meta_keywords,
        facebook_url: settings.facebook_url,
        instagram_url: settings.instagram_url,
        twitter_url: settings.twitter_url,
        // FAQ fields
        product_faqs: settings.product_faqs,
        general_faqs: settings.general_faqs,
      };

      // Remove undefined values to avoid database errors
      Object.keys(dbSettings).forEach(key => {
        if (dbSettings[key] === undefined) {
          delete dbSettings[key];
        }
      });

      // Try to update existing record first, then insert if not found
      const { data: existingRecord } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      let error;
      if (existingRecord) {
        // Update existing record
        const result = await supabase
          .from('site_settings')
          .update(dbSettings)
          .eq('id', existingRecord.id);
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('site_settings')
          .insert(dbSettings);
        error = result.error;
      }

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

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/admin/login');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  // FAQ Management Functions
  const addFaq = async (type: 'product' | 'general', question: string, answer: string) => {
    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, question, answer }),
      });

      if (!response.ok) {
        throw new Error('Failed to add FAQ');
      }

      const result = await response.json();

      // Update local state
      setSettings(prev => ({
        ...prev,
        [type === 'product' ? 'product_faqs' : 'general_faqs']: [
          ...(prev[type === 'product' ? 'product_faqs' : 'general_faqs'] || []),
          result.faq
        ]
      }));

      toast.success('FAQ added successfully');
      setShowFaqModal(false);
      setEditingFaq({ type, faq: null });
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast.error('Failed to add FAQ');
    }
  };

  const updateFaq = async (type: 'product' | 'general', id: string, question: string, answer: string) => {
    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, id, question, answer }),
      });

      if (!response.ok) {
        throw new Error('Failed to update FAQ');
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [type === 'product' ? 'product_faqs' : 'general_faqs']: (prev[type === 'product' ? 'product_faqs' : 'general_faqs'] || []).map(faq =>
          faq.id === id ? { ...faq, question, answer } : faq
        )
      }));

      toast.success('FAQ updated successfully');
      setShowFaqModal(false);
      setEditingFaq({ type, faq: null });
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    }
  };

  const deleteFaq = async (type: 'product' | 'general', id: string) => {
    try {
      const response = await fetch(`/api/admin/faqs?type=${type}&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete FAQ');
      }

      // Update local state
      setSettings(prev => ({
        ...prev,
        [type === 'product' ? 'product_faqs' : 'general_faqs']: (prev[type === 'product' ? 'product_faqs' : 'general_faqs'] || []).filter(faq => faq.id !== id)
      }));

      toast.success('FAQ deleted successfully');
      setDeletingFaq(null);
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    }
  };

  const renderGeneralSettings = () => (
    <div className="tw-space-y-6">
      <div>
        <label htmlFor="store_name" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Store Name
        </label>
        <input
          type="text"
          id="store_name"
          name="store_name"
          value={settings.store_name}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="low_stock_threshold" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Low Stock Threshold
        </label>
        <input
          type="number"
          id="low_stock_threshold"
          name="low_stock_threshold"
          value={settings.low_stock_threshold}
          onChange={handleNumberChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
        <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
          Alert when product stock falls below this number.
        </p>
      </div>
    </div>
  );

  const renderContactSettings = () => (
    <div className="tw-space-y-6">
      <div>
        <label htmlFor="store_email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Store Email
        </label>
        <input
          type="email"
          id="store_email"
          name="store_email"
          value={settings.store_email}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="store_phone" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Store Phone
        </label>
        <input
          type="text"
          id="store_phone"
          name="store_phone"
          value={settings.store_phone}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="order_notification_email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Order Notification Email
        </label>
        <input
          type="email"
          id="order_notification_email"
          name="order_notification_email"
          value={settings.order_notification_email}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
        <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
          Email address where order notifications will be sent.
        </p>
      </div>
    </div>
  );

  const renderSocialMediaSettings = () => (
    <div className="tw-space-y-6">
      <div>
        <label htmlFor="facebook_url" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Facebook URL
        </label>
        <input
          type="text"
          id="facebook_url"
          name="facebook_url"
          value={settings.facebook_url || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="instagram_url" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Instagram URL
        </label>
        <input
          type="text"
          id="instagram_url"
          name="instagram_url"
          value={settings.instagram_url || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="twitter_url" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Twitter URL
        </label>
        <input
          type="text"
          id="twitter_url"
          name="twitter_url"
          value={settings.twitter_url || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
      </div>
    </div>
  );

  const renderShippingSettings = () => (
    <div className="tw-space-y-6">
      <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-md tw-p-4">
        <div className="tw-flex">
          <div className="tw-flex-shrink-0">
            <svg className="tw-h-5 tw-w-5 tw-text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="tw-ml-3">
            <h3 className="tw-text-sm tw-font-medium tw-text-blue-800">
              Shipping Integration
            </h3>
            <div className="tw-mt-2 tw-text-sm tw-text-blue-700">
              <p>
                Shipping rates are handled by Easyship integration. Configure your origin address below for accurate shipping calculations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Origin Address Section */}
      <div>
        <h4 className="tw-text-lg tw-font-medium tw-text-gray-900 tw-mb-4">Origin Address (For Shipping Calculations)</h4>
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
          <div>
            <label htmlFor="origin_company" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="origin_company"
              name="company"
              value={settings.origin_address?.company || ''}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="origin_name" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              Contact Name
            </label>
            <input
              type="text"
              id="origin_name"
              name="name"
              value={settings.origin_address?.name || ''}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
            />
          </div>

          <div className="md:tw-col-span-2">
            <label htmlFor="origin_address" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="origin_address"
              name="address"
              value={settings.origin_address?.address || ''}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
              placeholder="3311 Cahuenga Blvd W"
            />
          </div>

          <div>
            <label htmlFor="origin_city" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              City
            </label>
            <input
              type="text"
              id="origin_city"
              name="city"
              value={settings.origin_address?.city || ''}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
              placeholder="Los Angeles"
            />
          </div>

          <div>
            <label htmlFor="origin_state" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              State
            </label>
            <input
              type="text"
              id="origin_state"
              name="state"
              value={settings.origin_address?.state || ''}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
              placeholder="CA"
            />
          </div>

          <div>
            <label htmlFor="origin_postalCode" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              id="origin_postalCode"
              name="postalCode"
              value={settings.origin_address?.postalCode || ''}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
              placeholder="90068"
            />
          </div>

          <div>
            <label htmlFor="origin_country" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              Country
            </label>
            <select
              id="origin_country"
              name="country"
              value={settings.origin_address?.country || 'US'}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>

          <div>
            <label htmlFor="origin_phone" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              Phone
            </label>
            <input
              type="text"
              id="origin_phone"
              name="phone"
              value={settings.origin_address?.phone || ''}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="origin_email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="origin_email"
              name="email"
              value={settings.origin_address?.email || ''}
              onChange={handleOriginAddressChange}
              className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="free_shipping_threshold" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Free Shipping Threshold ($)
        </label>
        <input
          type="number"
          step="0.01"
          id="free_shipping_threshold"
          name="free_shipping_threshold"
          value={settings.free_shipping_threshold || 100}
          onChange={handleNumberChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
        />
        <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
          Orders above this amount will qualify for free standard shipping.
        </p>
      </div>

      <div>
        <div className="tw-flex tw-items-center tw-mb-4">
          <input
            type="checkbox"
            id="tax_enabled"
            name="tax_enabled"
            checked={settings.tax_enabled || false}
            onChange={handleCheckboxChange}
            className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-blue-600 focus:tw-ring-blue-500"
          />
          <label htmlFor="tax_enabled" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
            Enable Tax Calculation
          </label>
        </div>

        <label htmlFor="tax_rate" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Tax Rate (%)
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          id="tax_rate"
          name="tax_rate"
          value={settings.tax_rate ? (settings.tax_rate * 100).toString() : ''}
          onChange={(e) => {
            const percentageValue = e.target.value;
            if (percentageValue === '') {
              setSettings(prev => ({ ...prev, tax_rate: 0 }));
            } else {
              const decimalValue = parseFloat(percentageValue) / 100;
              setSettings(prev => ({ ...prev, tax_rate: decimalValue }));
            }
          }}
          disabled={!settings.tax_enabled}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm disabled:tw-bg-gray-100"
          placeholder="8.75"
        />
        <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
          Enter as percentage (e.g., 8.75 for 8.75% tax rate).
        </p>
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="tw-space-y-6">
      <div>
        <label htmlFor="meta_title" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Meta Title
        </label>
        <input
          type="text"
          id="meta_title"
          name="meta_title"
          value={settings.meta_title || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
          placeholder="Mirror Exhibit - Premium Custom Mirrors"
        />
        <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
          The title that appears in search engine results and browser tabs.
        </p>
      </div>

      <div>
        <label htmlFor="meta_description" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Meta Description
        </label>
        <textarea
          id="meta_description"
          name="meta_description"
          rows={3}
          value={settings.meta_description || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
          placeholder="Discover premium custom mirrors and frames. High-quality craftsmanship, unique designs, and personalized service."
        />
        <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
          A brief description that appears in search engine results (150-160 characters recommended).
        </p>
      </div>

      <div>
        <label htmlFor="meta_keywords" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
          Meta Keywords
        </label>
        <input
          type="text"
          id="meta_keywords"
          name="meta_keywords"
          value={settings.meta_keywords || ''}
          onChange={handleChange}
          className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
          placeholder="custom mirrors, picture frames, wall mirrors, decorative mirrors"
        />
        <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
          Comma-separated keywords relevant to your business (optional, less important for modern SEO).
        </p>
      </div>
    </div>
  );

  const renderFaqSettings = () => (
    <div className="tw-space-y-8">
      {/* Product FAQs Section */}
      <div>
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Product Page FAQs</h3>
          <button
            type="button"
            onClick={() => {
              setEditingFaq({ type: 'product', faq: null });
              setShowFaqModal(true);
            }}
            className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500"
          >
            Add Product FAQ
          </button>
        </div>
        <p className="tw-text-sm tw-text-gray-500 tw-mb-4">
          These FAQs will appear on individual product detail pages.
        </p>
        <div className="tw-space-y-3">
          {(settings.product_faqs || []).map((faq, index) => (
            <div key={faq.id} className="tw-bg-gray-50 tw-p-4 tw-rounded-md">
              <div className="tw-flex tw-justify-between tw-items-start">
                <div className="tw-flex-1">
                  <h4 className="tw-font-medium tw-text-gray-900 tw-mb-2">
                    {index + 1}. {faq.question}
                  </h4>
                  <p className="tw-text-gray-700 tw-text-sm">{faq.answer}</p>
                </div>
                <div className="tw-flex tw-space-x-2 tw-ml-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq({ type: 'product', faq });
                      setShowFaqModal(true);
                    }}
                    className="tw-text-blue-600 hover:tw-text-blue-800 tw-text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingFaq({ type: 'product', id: faq.id })}
                    className="tw-text-red-600 hover:tw-text-red-800 tw-text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!settings.product_faqs || settings.product_faqs.length === 0) && (
            <p className="tw-text-gray-500 tw-text-sm tw-italic">No product FAQs added yet.</p>
          )}
        </div>
      </div>

      {/* General FAQs Section */}
      <div>
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">General FAQs</h3>
          <button
            type="button"
            onClick={() => {
              setEditingFaq({ type: 'general', faq: null });
              setShowFaqModal(true);
            }}
            className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500"
          >
            Add General FAQ
          </button>
        </div>
        <p className="tw-text-sm tw-text-gray-500 tw-mb-4">
          These FAQs will appear on the general FAQ page.
        </p>
        <div className="tw-space-y-3">
          {(settings.general_faqs || []).map((faq, index) => (
            <div key={faq.id} className="tw-bg-gray-50 tw-p-4 tw-rounded-md">
              <div className="tw-flex tw-justify-between tw-items-start">
                <div className="tw-flex-1">
                  <h4 className="tw-font-medium tw-text-gray-900 tw-mb-2">
                    {index + 1}. {faq.question}
                  </h4>
                  <p className="tw-text-gray-700 tw-text-sm">{faq.answer}</p>
                </div>
                <div className="tw-flex tw-space-x-2 tw-ml-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaq({ type: 'general', faq });
                      setShowFaqModal(true);
                    }}
                    className="tw-text-blue-600 hover:tw-text-blue-800 tw-text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingFaq({ type: 'general', id: faq.id })}
                    className="tw-text-red-600 hover:tw-text-red-800 tw-text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {(!settings.general_faqs || settings.general_faqs.length === 0) && (
            <p className="tw-text-gray-500 tw-text-sm tw-italic">No general FAQs added yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="tw-space-y-6">
      <div className="tw-bg-gray-50 tw-p-6 tw-rounded-lg">
        <h3 className="tw-text-lg tw-font-medium tw-text-gray-900 tw-mb-4">Account Management</h3>
        <p className="tw-text-sm tw-text-gray-600 tw-mb-6">
          Manage your admin account settings and sign out of the system.
        </p>

        <div className="tw-space-y-4">
          <div className="tw-flex tw-items-center tw-justify-between tw-p-4 tw-bg-white tw-rounded-md tw-border">
            <div>
              <h4 className="tw-text-sm tw-font-medium tw-text-gray-900">Sign Out</h4>
              <p className="tw-text-sm tw-text-gray-500">
                Sign out of your admin account and return to the login page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-text-white tw-bg-red-600 hover:tw-bg-red-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
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
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`tw-px-6 tw-py-4 tw-text-sm tw-font-medium ${
                    activeTab === 'seo'
                      ? 'tw-border-b-2 tw-border-blue-500 tw-text-blue-600'
                      : 'tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  SEO
                </button>
                <button
                  onClick={() => setActiveTab('faqs')}
                  className={`tw-px-6 tw-py-4 tw-text-sm tw-font-medium ${
                    activeTab === 'faqs'
                      ? 'tw-border-b-2 tw-border-blue-500 tw-text-blue-600'
                      : 'tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  FAQs
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`tw-px-6 tw-py-4 tw-text-sm tw-font-medium ${
                    activeTab === 'account'
                      ? 'tw-border-b-2 tw-border-blue-500 tw-text-blue-600'
                      : 'tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  Account
                </button>
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="tw-p-6">
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'contact' && renderContactSettings()}
              {activeTab === 'social' && renderSocialMediaSettings()}
              {activeTab === 'shipping' && renderShippingSettings()}
              {activeTab === 'seo' && renderSEOSettings()}
              {activeTab === 'faqs' && renderFaqSettings()}
              {activeTab === 'account' && renderAccountSettings()}

              {activeTab !== 'account' && (
                <div className="tw-mt-8 tw-flex tw-justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-shadow-sm tw-text-white tw-bg-blue-600 hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500 disabled:tw-opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg className="tw-animate-spin tw--ml-1 tw-mr-3 tw-h-5 tw-w-5 tw-text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : 'Save Settings'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* FAQ Modal */}
      {showFaqModal && (
        <FaqModal
          isOpen={showFaqModal}
          onClose={() => {
            setShowFaqModal(false);
            setEditingFaq({ type: 'product', faq: null });
          }}
          onSave={(question, answer) => {
            if (editingFaq.faq) {
              updateFaq(editingFaq.type, editingFaq.faq.id, question, answer);
            } else {
              addFaq(editingFaq.type, question, answer);
            }
          }}
          type={editingFaq.type}
          initialData={editingFaq.faq}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingFaq && (
        <DeleteConfirmationDialog
          isOpen={!!deletingFaq}
          onClose={() => setDeletingFaq(null)}
          onConfirm={() => {
            if (deletingFaq) {
              deleteFaq(deletingFaq.type, deletingFaq.id);
            }
          }}
          title="Delete FAQ"
          message="Are you sure you want to delete this FAQ? This action cannot be undone."
        />
      )}
    </SimpleAdminLayout>
  );
}

// FAQ Modal Component
interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: string, answer: string) => void;
  type: 'product' | 'general';
  initialData?: FAQ | null;
}

const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose, onSave, type, initialData }) => {
  const [question, setQuestion] = useState(initialData?.question || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim()) {
      onSave(question.trim(), answer.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-white tw-rounded-lg tw-p-6 tw-w-full tw-max-w-2xl tw-mx-4">
        <h3 className="tw-text-lg tw-font-medium tw-text-gray-900 tw-mb-4">
          {initialData ? 'Edit' : 'Add'} {type === 'product' ? 'Product' : 'General'} FAQ
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="tw-mb-4">
            <label htmlFor="question" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
              Question
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
              placeholder="Enter the FAQ question"
              required
            />
          </div>
          <div className="tw-mb-6">
            <label htmlFor="answer" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
              Answer
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500"
              placeholder="Enter the FAQ answer"
              required
            />
          </div>
          <div className="tw-flex tw-justify-end tw-space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded-md hover:tw-bg-gray-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 tw-border tw-border-transparent tw-rounded-md hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500"
            >
              {initialData ? 'Update' : 'Add'} FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Dialog Component
interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
      <div className="tw-bg-white tw-rounded-lg tw-p-6 tw-w-full tw-max-w-md tw-mx-4">
        <h3 className="tw-text-lg tw-font-medium tw-text-gray-900 tw-mb-4">{title}</h3>
        <p className="tw-text-sm tw-text-gray-500 tw-mb-6">{message}</p>
        <div className="tw-flex tw-justify-end tw-space-x-3">
          <button
            onClick={onClose}
            className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded-md hover:tw-bg-gray-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white tw-bg-red-600 tw-border tw-border-transparent tw-rounded-md hover:tw-bg-red-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
