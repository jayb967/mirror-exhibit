'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin: string;
  avatar: string;
  createdAt: string;
  emailVerified: boolean;
  banned: boolean;
  locked: boolean;
  twoFactorEnabled: boolean;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
}

interface UserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}

export default function UserModal({ isOpen, user, onClose, onSave }: UserModalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [role, setRole] = useState('customer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  // Orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Handle body scroll lock when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen && user) {
      setRole(user.role || 'customer');
      
      // Parse name into first and last name
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      
      setActiveTab('general');
      
      // Load user orders
      loadUserOrders(user.id);
    }
  }, [isOpen, user]);

  const loadUserOrders = async (userId: string) => {
    try {
      setOrdersLoading(true);
      const response = await fetch(`/api/admin/orders?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error('Failed to load user orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading user orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update user role
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'updateRole',
          role: role
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      toast.success('User updated successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleUserAction = async (action: string) => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: action
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      toast.success(`User ${action}ned successfully`);
      onSave();
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !user) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-overflow-y-auto">
      <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-pt-4 tw-px-4 tw-pb-20 tw-text-center sm:tw-block sm:tw-p-0">
        <div className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity" onClick={onClose}></div>

        <div className="tw-inline-block tw-align-bottom tw-bg-white tw-rounded-lg tw-text-left tw-overflow-hidden tw-shadow-xl tw-transform tw-transition-all sm:tw-my-8 sm:tw-align-middle sm:tw-max-w-4xl sm:tw-w-full">
          <div className="tw-bg-white tw-px-4 tw-pt-5 tw-pb-4 sm:tw-p-6">
            {/* Header */}
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0 tw-h-12 tw-w-12 tw-relative tw-mr-4">
                  <Image
                    className="tw-rounded-full"
                    src={user.avatar}
                    alt={user.name}
                    fill
                  />
                </div>
                <div>
                  <h2 className="tw-text-xl tw-font-semibold tw-text-gray-900">{user.name}</h2>
                  <p className="tw-text-sm tw-text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors"
              >
                <svg className="tw-w-6 tw-h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="tw-border-b tw-border-gray-200 tw-mb-6">
              <nav className="-tw-mb-px tw-flex tw-space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`tw-py-2 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                    activeTab === 'general'
                      ? 'tw-border-blue-500 tw-text-blue-600'
                      : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`tw-py-2 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                    activeTab === 'orders'
                      ? 'tw-border-blue-500 tw-text-blue-600'
                      : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  Orders ({orders.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="tw-max-h-96 tw-overflow-y-auto">
              {activeTab === 'general' && (
                <div className="tw-space-y-6">
                  {/* User Info */}
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                        Status
                      </label>
                      <div className="tw-flex tw-items-center tw-space-x-4">
                        <span className={`tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full ${
                          user.status === 'active' ? 'tw-bg-green-100 tw-text-green-800' : 'tw-bg-red-100 tw-text-red-800'
                        }`}>
                          {user.status}
                        </span>
                        {user.banned && (
                          <span className="tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full tw-bg-red-100 tw-text-red-800">
                            Banned
                          </span>
                        )}
                        {user.locked && (
                          <span className="tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full tw-bg-yellow-100 tw-text-yellow-800">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                        Email Verified
                      </label>
                      <span className={`tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full ${
                        user.emailVerified ? 'tw-bg-green-100 tw-text-green-800' : 'tw-bg-red-100 tw-text-red-800'
                      }`}>
                        {user.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>

                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                        2FA Enabled
                      </label>
                      <span className={`tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full ${
                        user.twoFactorEnabled ? 'tw-bg-green-100 tw-text-green-800' : 'tw-bg-gray-100 tw-text-gray-800'
                      }`}>
                        {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                        Created At
                      </label>
                      <p className="tw-text-sm tw-text-gray-900">{formatDate(user.createdAt)}</p>
                    </div>

                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                        Last Login
                      </label>
                      <p className="tw-text-sm tw-text-gray-900">{formatDate(user.lastLogin)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="tw-flex tw-space-x-4">
                    {!user.banned ? (
                      <button
                        onClick={() => handleUserAction('ban')}
                        disabled={loading}
                        className="tw-px-4 tw-py-2 tw-bg-red-600 tw-text-white tw-rounded-md hover:tw-bg-red-700 disabled:tw-opacity-50"
                      >
                        {loading ? 'Processing...' : 'Ban User'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction('unban')}
                        disabled={loading}
                        className="tw-px-4 tw-py-2 tw-bg-green-600 tw-text-white tw-rounded-md hover:tw-bg-green-700 disabled:tw-opacity-50"
                      >
                        {loading ? 'Processing...' : 'Unban User'}
                      </button>
                    )}

                    {!user.locked ? (
                      <button
                        onClick={() => handleUserAction('lock')}
                        disabled={loading}
                        className="tw-px-4 tw-py-2 tw-bg-yellow-600 tw-text-white tw-rounded-md hover:tw-bg-yellow-700 disabled:tw-opacity-50"
                      >
                        {loading ? 'Processing...' : 'Lock User'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction('unlock')}
                        disabled={loading}
                        className="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md hover:tw-bg-blue-700 disabled:tw-opacity-50"
                      >
                        {loading ? 'Processing...' : 'Unlock User'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  {ordersLoading ? (
                    <div className="tw-text-center tw-py-8">
                      <div className="tw-animate-spin tw-w-8 tw-h-8 tw-border-4 tw-border-blue-500 tw-border-t-transparent tw-rounded-full tw-mx-auto"></div>
                      <p className="tw-mt-2 tw-text-gray-600">Loading orders...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="tw-space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="tw-border tw-border-gray-200 tw-rounded-lg tw-p-4">
                          <div className="tw-flex tw-justify-between tw-items-start tw-mb-2">
                            <div>
                              <p className="tw-font-medium tw-text-gray-900">Order #{order.id.slice(0, 8)}</p>
                              <p className="tw-text-sm tw-text-gray-500">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="tw-text-right">
                              <p className="tw-font-medium tw-text-gray-900">{formatCurrency(order.total_amount)}</p>
                              <span className={`tw-px-2 tw-py-1 tw-text-xs tw-font-semibold tw-rounded-full ${
                                order.status === 'completed' ? 'tw-bg-green-100 tw-text-green-800' :
                                order.status === 'pending' ? 'tw-bg-yellow-100 tw-text-yellow-800' :
                                'tw-bg-gray-100 tw-text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          {order.order_items && order.order_items.length > 0 && (
                            <div className="tw-mt-2">
                              <p className="tw-text-sm tw-text-gray-600">
                                {order.order_items.length} item(s): {order.order_items.map(item => item.product_name).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="tw-text-center tw-py-8">
                      <p className="tw-text-gray-500">No orders found for this user.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="tw-flex tw-justify-end tw-space-x-4 tw-mt-6 tw-pt-6 tw-border-t tw-border-gray-200">
              <button
                onClick={onClose}
                className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-text-gray-700 hover:tw-bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md hover:tw-bg-blue-700 disabled:tw-opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
