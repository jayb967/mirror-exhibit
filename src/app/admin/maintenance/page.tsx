'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function MaintenancePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    deletedUsers?: number;
    deletedCartItems?: number;
    error?: string;
  } | null>(null);
  const [daysOld, setDaysOld] = useState(30);

  const supabase = createClientComponentClient();

  const handleCleanupGuestData = async () => {
    setLoading(true);
    setResults(null);

    try {
      // Call the cleanup function
      const { data, error } = await supabase.rpc('cleanup_old_guest_data', {
        p_days_old: daysOld
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setResults({
          deletedUsers: data[0].deleted_users,
          deletedCartItems: data[0].deleted_cart_items
        });

        toast.success(`Cleanup completed: ${data[0].deleted_users} guest users and ${data[0].deleted_cart_items} cart items removed`);
      } else {
        setResults({
          deletedUsers: 0,
          deletedCartItems: 0
        });

        toast.info('No data to clean up');
      }
    } catch (error: any) {
      console.error('Error cleaning up guest data:', error);
      setResults({ error: error.message || 'Failed to clean up guest data' });
      toast.error(error.message || 'Failed to clean up guest data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <h1 className="tw-text-2xl tw-font-bold tw-mb-6">Maintenance Tasks</h1>

      <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6 tw-mb-8">
        <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Guest Data Cleanup</h2>
        <p className="tw-mb-4 tw-text-gray-600">
          This task removes guest user data that is older than the specified number of days and has no associated orders.
          This helps keep your database clean and reduces storage costs.
        </p>

        <div className="tw-mb-4">
          <label htmlFor="daysOld" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
            Days Old
          </label>
          <div className="tw-flex tw-items-center tw-space-x-4">
            <input
              type="number"
              id="daysOld"
              value={daysOld}
              onChange={(e) => setDaysOld(parseInt(e.target.value) || 30)}
              min="1"
              max="365"
              className="tw-w-24 tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md"
            />
            <span className="tw-text-gray-500">days</span>
          </div>
          <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
            Guest data older than this many days will be removed if it has no associated orders.
          </p>
        </div>

        <button
          onClick={handleCleanupGuestData}
          disabled={loading}
          className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-font-medium hover:tw-bg-blue-700 tw-transition-colors disabled:tw-opacity-70"
        >
          {loading ? 'Cleaning up...' : 'Run Cleanup'}
        </button>

        {results && (
          <div className="tw-mt-6 tw-p-4 tw-bg-gray-50 tw-rounded-md">
            <h3 className="tw-font-medium tw-mb-2">Results</h3>

            {results.error ? (
              <p className="tw-text-red-600">{results.error}</p>
            ) : (
              <div>
                <p>Guest users removed: <span className="tw-font-medium">{results.deletedUsers}</span></p>
                <p>Cart items removed: <span className="tw-font-medium">{results.deletedCartItems}</span></p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
        <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Automatic Cleanup</h2>
        <p className="tw-mb-4 tw-text-gray-600">
          Guest data cleanup is scheduled to run automatically every day at 3:00 AM.
          The automatic cleanup removes guest data that is older than 30 days and has no associated orders.
        </p>
        <p className="tw-text-sm tw-text-gray-500">
          Note: Automatic cleanup requires the pg_cron extension to be enabled in your Supabase project.
          If it's not enabled, you can run the cleanup manually using the button above.
        </p>
      </div>
      </div>
    </AdminLayout>
  );
}
