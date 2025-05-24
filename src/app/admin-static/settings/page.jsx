'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';
import StaticNavigation from '@/components/admin/StaticNavigation';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    support_phone: '',
    shipping_fee: 0,
    free_shipping_threshold: 0,
  });
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
        
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .single();
          
        if (error && error.code !== 'PGRST116') {
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
    
    fetchSettings();
  }, []);
  
  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const supabase = createClientComponentClient();
      
      const { error } = await supabase
        .from('settings')
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

  return (
    <div className="tw-min-h-screen tw-bg-[#F8F8F8]">
      <ToastContainer />
      
      {/* Navigation */}
      <StaticNavigation currentPath={pathname} />
      
      {/* Main content */}
      <div className="tw-md:ml-64 tw-p-4 tw-pt-8">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Settings</h1>
        
        {loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent"></div>
          </div>
        ) : (
          <div className="tw-bg-white tw-shadow-md tw-p-6">
            <form onSubmit={handleSubmit}>
              <div className="tw-mb-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">General Settings</h2>
                
                <div className="tw-mb-4">
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="site_name"
                    value={settings.site_name}
                    onChange={handleChange}
                    className="tw-w-full tw-p-2 tw-border tw-border-gray-300"
                  />
                </div>
                
                <div className="tw-mb-4">
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Site Description
                  </label>
                  <textarea
                    name="site_description"
                    value={settings.site_description}
                    onChange={handleChange}
                    rows="3"
                    className="tw-w-full tw-p-2 tw-border tw-border-gray-300"
                  ></textarea>
                </div>
              </div>
              
              <div className="tw-mb-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Contact Information</h2>
                
                <div className="tw-mb-4">
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={settings.contact_email}
                    onChange={handleChange}
                    className="tw-w-full tw-p-2 tw-border tw-border-gray-300"
                  />
                </div>
                
                <div className="tw-mb-4">
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    name="support_phone"
                    value={settings.support_phone}
                    onChange={handleChange}
                    className="tw-w-full tw-p-2 tw-border tw-border-gray-300"
                  />
                </div>
              </div>
              
              <div className="tw-mb-6">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Shipping Settings</h2>
                
                <div className="tw-mb-4">
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Shipping Fee ($)
                  </label>
                  <input
                    type="number"
                    name="shipping_fee"
                    value={settings.shipping_fee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="tw-w-full tw-p-2 tw-border tw-border-gray-300"
                  />
                </div>
                
                <div className="tw-mb-4">
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Free Shipping Threshold ($)
                  </label>
                  <input
                    type="number"
                    name="free_shipping_threshold"
                    value={settings.free_shipping_threshold}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="tw-w-full tw-p-2 tw-border tw-border-gray-300"
                  />
                </div>
              </div>
              
              <div className="tw-mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="tw-bg-black tw-text-white tw-px-6 tw-py-2 hover:tw-bg-[#A6A182] tw-disabled:tw-opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
