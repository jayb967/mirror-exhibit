'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import { format } from 'date-fns';

interface GuestUser {
  id: string;
  guest_token: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  cart_items_count: number;
  orders_count: number;
}

interface GuestStats {
  total_guests: number;
  guests_with_orders: number;
  conversion_rate: number;
  abandoned_carts: number;
  average_cart_value: number;
}

export default function GuestManagementPage() {
  const [guestUsers, setGuestUsers] = useState<GuestUser[]>([]);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupResults, setCleanupResults] = useState<{
    deletedUsers: number;
    deletedCartItems: number;
  } | null>(null);
  const [daysOld, setDaysOld] = useState(30);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchGuestUsers();
    fetchGuestStats();
  }, []);

  const fetchGuestUsers = async () => {
    try {
      setLoading(true);

      // Get guest users with cart items count and orders count
      const { data, error } = await supabase.rpc('get_guest_users_with_stats');

      if (error) throw error;

      setGuestUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching guest users:', error);
      toast.error('Failed to load guest users');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestStats = async () => {
    try {
      // Get guest statistics
      const { data, error } = await supabase.rpc('get_guest_stats');

      if (error) throw error;

      if (data && data.length > 0) {
        setGuestStats(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching guest statistics:', error);
      toast.error('Failed to load guest statistics');
    }
  };

  const handleCleanupGuestData = async () => {
    try {
      setCleanupLoading(true);
      setCleanupResults(null);

      // Call the cleanup function
      const { data, error } = await supabase.rpc('cleanup_old_guest_data', {
        p_days_old: daysOld
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setCleanupResults({
          deletedUsers: data[0].deleted_users,
          deletedCartItems: data[0].deleted_cart_items
        });

        toast.success(`Cleanup completed: ${data[0].deleted_users} guest users and ${data[0].deleted_cart_items} cart items removed`);

        // Refresh the guest users list and stats
        fetchGuestUsers();
        fetchGuestStats();
      } else {
        setCleanupResults({
          deletedUsers: 0,
          deletedCartItems: 0
        });

        toast.info('No data to clean up');
      }
    } catch (error: any) {
      console.error('Error cleaning up guest data:', error);
      toast.error(error.message || 'Failed to clean up guest data');
    } finally {
      setCleanupLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
      <h1 className="tw-text-2xl tw-font-bold tw-mb-6">Guest User Management</h1>

      {/* Guest Statistics */}
      {guestStats && (
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4 tw-mb-8">
          <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
            <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-1">Total Guests</h3>
            <p className="tw-text-3xl tw-font-bold">{guestStats.total_guests}</p>
          </div>

          <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
            <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-1">Guests with Orders</h3>
            <p className="tw-text-3xl tw-font-bold">{guestStats.guests_with_orders}</p>
          </div>

          <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
            <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-1">Conversion Rate</h3>
            <p className="tw-text-3xl tw-font-bold">{(guestStats.conversion_rate * 100).toFixed(1)}%</p>
          </div>

          <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
            <h3 className="tw-text-sm tw-font-medium tw-text-gray-500 tw-uppercase tw-mb-1">Abandoned Carts</h3>
            <p className="tw-text-3xl tw-font-bold">{guestStats.abandoned_carts}</p>
          </div>
        </div>
      )}

      {/* Guest Data Cleanup */}
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
          disabled={cleanupLoading}
          className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-font-medium hover:tw-bg-blue-700 tw-transition-colors disabled:tw-opacity-70"
        >
          {cleanupLoading ? 'Cleaning up...' : 'Run Cleanup'}
        </button>

        {cleanupResults && (
          <div className="tw-mt-6 tw-p-4 tw-bg-gray-50 tw-rounded-md">
            <h3 className="tw-font-medium tw-mb-2">Results</h3>
            <p>Guest users removed: <span className="tw-font-medium">{cleanupResults.deletedUsers}</span></p>
            <p>Cart items removed: <span className="tw-font-medium">{cleanupResults.deletedCartItems}</span></p>
          </div>
        )}
      </div>

      {/* Guest Users Table */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden">
        <div className="tw-p-6 tw-border-b tw-border-gray-200">
          <h2 className="tw-text-xl tw-font-semibold">Guest Users</h2>
          <p className="tw-text-gray-600">Showing all guest users in the system</p>
        </div>

        <div className="tw-overflow-x-auto">
          {loading ? (
            <div className="tw-p-6 tw-text-center">
              <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-t-2 tw-border-b-2 tw-border-blue-500 tw-mx-auto"></div>
              <p className="tw-mt-4 tw-text-gray-600">Loading guest users...</p>
            </div>
          ) : guestUsers.length === 0 ? (
            <div className="tw-p-6 tw-text-center tw-text-gray-500">
              No guest users found
            </div>
          ) : (
            <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
              <thead className="tw-bg-gray-50">
                <tr>
                  <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                    Guest
                  </th>
                  <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                    Cart Items
                  </th>
                  <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                {guestUsers.map((guest) => (
                  <tr key={guest.id} className="hover:tw-bg-gray-50">
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <div className="tw-font-medium tw-text-gray-900">
                        {guest.first_name} {guest.last_name}
                      </div>
                      <div className="tw-text-xs tw-text-gray-500">
                        {guest.guest_token.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                      {guest.email || 'No email'}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                      {formatDate(guest.created_at)}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                      {guest.cart_items_count}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                      {guest.orders_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
    </SimpleAdminLayout>
  );
}
