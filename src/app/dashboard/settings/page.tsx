'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useClerkAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  BellIcon,
  EnvelopeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface NotificationPreferences {
  email_order_updates: boolean;
  email_shipping_updates: boolean;
  email_promotional: boolean;
  email_system_updates: boolean;
  in_app_order_updates: boolean;
  in_app_shipping_updates: boolean;
  in_app_promotional: boolean;
  in_app_system_updates: boolean;
  unsubscribed_all: boolean;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || getDefaultPreferences());
      } else {
        // If no preferences exist, create default ones
        setPreferences(getDefaultPreferences());
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setPreferences(getDefaultPreferences());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPreferences = (): NotificationPreferences => ({
    email_order_updates: true,
    email_shipping_updates: true,
    email_promotional: true,
    email_system_updates: true,
    in_app_order_updates: true,
    in_app_shipping_updates: true,
    in_app_promotional: true,
    in_app_system_updates: false,
    unsubscribed_all: false
  });

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!preferences) return;

    try {
      setSaving(true);
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPreferences),
      });

      if (response.ok) {
        setPreferences(updatedPreferences);
        setSaveMessage('Preferences saved successfully!');
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveMessage('Failed to save preferences. Please try again.');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    updatePreferences({ [key]: !preferences[key] });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2" style={{ borderColor: '#A6A182' }}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!preferences) {
    return (
      <DashboardLayout>
        <div className="tw-text-center tw-py-12">
          <p className="tw-text-gray-500">Failed to load preferences. Please refresh the page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="tw-space-y-6">
        {/* Header */}
        <div>
          <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">Notification Settings</h1>
          <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
            Manage how you receive notifications about your orders and account
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`
            tw-rounded-md tw-p-4 tw-flex tw-items-center tw-space-x-2
            ${saveMessage.includes('successfully') 
              ? 'tw-bg-green-50 tw-text-green-800' 
              : 'tw-bg-red-50 tw-text-red-800'
            }
          `}>
            {saveMessage.includes('successfully') && (
              <CheckIcon className="tw-h-5 tw-w-5 tw-text-green-400" />
            )}
            <span className="tw-text-sm">{saveMessage}</span>
          </div>
        )}

        {/* Global Settings */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
          <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
            <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Global Settings</h3>
          </div>
          <div className="tw-p-6">
            <div className="tw-flex tw-items-center tw-justify-between">
              <div>
                <h4 className="tw-text-sm tw-font-medium tw-text-gray-900">
                  Unsubscribe from all notifications
                </h4>
                <p className="tw-text-sm tw-text-gray-500">
                  Turn off all email and in-app notifications
                </p>
              </div>
              <button
                onClick={() => handleToggle('unsubscribed_all')}
                disabled={saving}
                className={`
                  tw-relative tw-inline-flex tw-h-6 tw-w-11 tw-flex-shrink-0 tw-cursor-pointer tw-rounded-full tw-border-2 tw-border-transparent tw-transition-colors tw-duration-200 tw-ease-in-out focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2
                  ${preferences.unsubscribed_all ? 'tw-bg-red-600' : 'tw-bg-gray-200'}
                  ${saving ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}
                `}
                style={!preferences.unsubscribed_all ? { backgroundColor: '#A6A182' } : {}}
              >
                <span
                  className={`
                    tw-pointer-events-none tw-inline-block tw-h-5 tw-w-5 tw-rounded-full tw-bg-white tw-shadow tw-transform tw-ring-0 tw-transition tw-duration-200 tw-ease-in-out
                    ${preferences.unsubscribed_all ? 'tw-translate-x-5' : 'tw-translate-x-0'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
          <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
            <div className="tw-flex tw-items-center tw-space-x-2">
              <EnvelopeIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />
              <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Email Notifications</h3>
            </div>
          </div>
          <div className="tw-divide-y tw-divide-gray-200">
            {[
              {
                key: 'email_order_updates' as keyof NotificationPreferences,
                title: 'Order Updates',
                description: 'Notifications about order confirmations, status changes, and payment confirmations'
              },
              {
                key: 'email_shipping_updates' as keyof NotificationPreferences,
                title: 'Shipping Updates',
                description: 'Notifications when your orders are shipped and delivered'
              },
              {
                key: 'email_promotional' as keyof NotificationPreferences,
                title: 'Promotional Emails',
                description: 'Special offers, new product announcements, and marketing communications'
              },
              {
                key: 'email_system_updates' as keyof NotificationPreferences,
                title: 'System Updates',
                description: 'Important account and system notifications'
              }
            ].map((item) => (
              <div key={item.key} className="tw-p-6">
                <div className="tw-flex tw-items-center tw-justify-between">
                  <div>
                    <h4 className="tw-text-sm tw-font-medium tw-text-gray-900">
                      {item.title}
                    </h4>
                    <p className="tw-text-sm tw-text-gray-500">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key)}
                    disabled={saving || preferences.unsubscribed_all}
                    className={`
                      tw-relative tw-inline-flex tw-h-6 tw-w-11 tw-flex-shrink-0 tw-cursor-pointer tw-rounded-full tw-border-2 tw-border-transparent tw-transition-colors tw-duration-200 tw-ease-in-out focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2
                      ${preferences[item.key] && !preferences.unsubscribed_all ? 'tw-bg-gray-200' : 'tw-bg-gray-200'}
                      ${saving || preferences.unsubscribed_all ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}
                    `}
                    style={preferences[item.key] && !preferences.unsubscribed_all ? { backgroundColor: '#A6A182' } : {}}
                  >
                    <span
                      className={`
                        tw-pointer-events-none tw-inline-block tw-h-5 tw-w-5 tw-rounded-full tw-bg-white tw-shadow tw-transform tw-ring-0 tw-transition tw-duration-200 tw-ease-in-out
                        ${preferences[item.key] && !preferences.unsubscribed_all ? 'tw-translate-x-5' : 'tw-translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
          <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
            <div className="tw-flex tw-items-center tw-space-x-2">
              <BellIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />
              <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">In-App Notifications</h3>
            </div>
          </div>
          <div className="tw-divide-y tw-divide-gray-200">
            {[
              {
                key: 'in_app_order_updates' as keyof NotificationPreferences,
                title: 'Order Updates',
                description: 'Show notifications in your dashboard for order updates'
              },
              {
                key: 'in_app_shipping_updates' as keyof NotificationPreferences,
                title: 'Shipping Updates',
                description: 'Show notifications in your dashboard for shipping updates'
              },
              {
                key: 'in_app_promotional' as keyof NotificationPreferences,
                title: 'Promotional Notifications',
                description: 'Show promotional notifications in your dashboard'
              },
              {
                key: 'in_app_system_updates' as keyof NotificationPreferences,
                title: 'System Updates',
                description: 'Show system and maintenance notifications in your dashboard'
              }
            ].map((item) => (
              <div key={item.key} className="tw-p-6">
                <div className="tw-flex tw-items-center tw-justify-between">
                  <div>
                    <h4 className="tw-text-sm tw-font-medium tw-text-gray-900">
                      {item.title}
                    </h4>
                    <p className="tw-text-sm tw-text-gray-500">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.key)}
                    disabled={saving || preferences.unsubscribed_all}
                    className={`
                      tw-relative tw-inline-flex tw-h-6 tw-w-11 tw-flex-shrink-0 tw-cursor-pointer tw-rounded-full tw-border-2 tw-border-transparent tw-transition-colors tw-duration-200 tw-ease-in-out focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2
                      ${preferences[item.key] && !preferences.unsubscribed_all ? 'tw-bg-gray-200' : 'tw-bg-gray-200'}
                      ${saving || preferences.unsubscribed_all ? 'tw-opacity-50 tw-cursor-not-allowed' : ''}
                    `}
                    style={preferences[item.key] && !preferences.unsubscribed_all ? { backgroundColor: '#A6A182' } : {}}
                  >
                    <span
                      className={`
                        tw-pointer-events-none tw-inline-block tw-h-5 tw-w-5 tw-rounded-full tw-bg-white tw-shadow tw-transform tw-ring-0 tw-transition tw-duration-200 tw-ease-in-out
                        ${preferences[item.key] && !preferences.unsubscribed_all ? 'tw-translate-x-5' : 'tw-translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="tw-bg-gray-50 tw-rounded-lg tw-p-6">
          <h4 className="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-2">
            Need Help?
          </h4>
          <p className="tw-text-sm tw-text-gray-600">
            If you're not receiving notifications or have questions about your preferences, 
            please contact our support team. You can always change these settings later.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
