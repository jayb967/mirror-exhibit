'use client';

import React, { useState, useEffect } from 'react';
import BasicAdminLayout from '@/components/admin/BasicAdminLayout';
import { 
  BellIcon,
  CheckIcon,
  ArchiveBoxIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  data?: any;
}

interface NotificationsData {
  notifications: AdminNotification[];
  total: number;
  unreadCount: number;
}

const AdminNotificationsPage: React.FC = () => {
  const [notificationsData, setNotificationsData] = useState<NotificationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchNotifications();
  }, [filter, typeFilter, currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: offset.toString(),
      });

      if (filter === 'unread') {
        params.append('unread_only', 'true');
      }

      if (typeFilter) {
        params.append('type', typeFilter);
      }

      const response = await fetch(`/api/admin/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setNotificationsData(data);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'mark_read' }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!notificationsData) return;
      
      const unreadNotifications = notificationsData.notifications.filter(n => !n.is_read);
      
      await Promise.all(
        unreadNotifications.map(notification =>
          fetch(`/api/notifications/${notification.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'mark_read' }),
          })
        )
      );

      fetchNotifications();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin_new_order':
        return <BellIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
      case 'admin_system_alert':
        return <BellIcon className="tw-h-5 tw-w-5 tw-text-yellow-500" />;
      case 'admin_low_stock':
        return <BellIcon className="tw-h-5 tw-w-5 tw-text-red-500" />;
      default:
        return <BellIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
    }
  };

  const notificationTypes = [
    { value: '', label: 'All Types' },
    { value: 'admin_new_order', label: 'New Orders' },
    { value: 'admin_system_alert', label: 'System Alerts' },
    { value: 'admin_low_stock', label: 'Low Stock' },
    { value: 'admin_payment_issue', label: 'Payment Issues' },
  ];

  if (loading && !notificationsData) {
    return (
      <BasicAdminLayout>
        <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2" style={{ borderColor: '#A6A182' }}></div>
        </div>
      </BasicAdminLayout>
    );
  }

  return (
    <BasicAdminLayout>
      <div className="tw-space-y-6">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-justify-between">
          <div>
            <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">Admin Notifications</h1>
            <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
              Manage system notifications and alerts
            </p>
          </div>
          <div className="tw-flex tw-items-center tw-space-x-3">
            {notificationsData && notificationsData.unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50"
              >
                <CheckIcon className="tw--ml-0.5 tw-mr-2 tw-h-4 tw-w-4" />
                Mark All Read ({notificationsData.unreadCount})
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-text-white tw-shadow-sm hover:tw-opacity-90"
              style={{ backgroundColor: '#A6A182' }}
            >
              <PlusIcon className="tw--ml-1 tw-mr-2 tw-h-5 tw-w-5" />
              Create Notification
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-p-6">
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4">
            {/* Status Filter */}
            <div className="tw-flex tw-items-center tw-space-x-2">
              <FunnelIcon className="tw-h-5 tw-w-5 tw-text-gray-400" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="tw-block tw-pl-3 tw-pr-10 tw-py-2 tw-text-base tw-border-gray-300 focus:tw-outline-none tw-rounded-md"
                style={{ borderColor: '#A6A182' }}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="tw-flex tw-items-center tw-space-x-2">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="tw-block tw-pl-3 tw-pr-10 tw-py-2 tw-text-base tw-border-gray-300 focus:tw-outline-none tw-rounded-md"
                style={{ borderColor: '#A6A182' }}
              >
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
          {notificationsData?.notifications && notificationsData.notifications.length > 0 ? (
            <div className="tw-divide-y tw-divide-gray-200">
              {notificationsData.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    tw-p-6 tw-transition-colors
                    ${!notification.is_read ? 'tw-bg-gray-50' : 'tw-bg-white hover:tw-bg-gray-50'}
                  `}
                >
                  <div className="tw-flex tw-items-start tw-space-x-4">
                    <div className="tw-flex-shrink-0">
                      <div className={`
                        tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center
                        ${!notification.is_read ? 'tw-bg-gray-200' : 'tw-bg-gray-100'}
                      `}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="tw-flex-1 tw-min-w-0">
                      <div className="tw-flex tw-items-start tw-justify-between">
                        <div className="tw-flex-1">
                          <h3 className={`
                            tw-text-sm tw-font-medium
                            ${!notification.is_read ? 'tw-text-gray-900' : 'tw-text-gray-700'}
                          `}>
                            {notification.title}
                          </h3>
                          <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
                            {notification.message}
                          </p>
                          <div className="tw-mt-2 tw-flex tw-items-center tw-space-x-4">
                            <span className="tw-text-xs tw-text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                            <span className={`
                              tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium
                              ${notification.type === 'admin_new_order' ? 'tw-bg-green-100 tw-text-green-800' :
                                notification.type === 'admin_system_alert' ? 'tw-bg-yellow-100 tw-text-yellow-800' :
                                notification.type === 'admin_low_stock' ? 'tw-bg-red-100 tw-text-red-800' :
                                'tw-bg-gray-100 tw-text-gray-800'}
                            `}>
                              {notification.type.replace('admin_', '').replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="tw-flex tw-items-center tw-space-x-2 tw-ml-4">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="tw-p-1 tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors"
                              title="Mark as read"
                            >
                              <EyeIcon className="tw-h-4 tw-w-4" />
                            </button>
                          )}
                          
                          {notification.action_url && (
                            <a
                              href={notification.action_url}
                              className="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-border tw-border-transparent tw-text-xs tw-font-medium tw-rounded tw-text-white tw-transition-colors"
                              style={{ backgroundColor: '#A6A182' }}
                              onClick={() => {
                                if (!notification.is_read) {
                                  markAsRead(notification.id);
                                }
                              }}
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tw-text-center tw-py-12">
              <BellIcon className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400" />
              <h3 className="tw-mt-2 tw-text-sm tw-font-medium tw-text-gray-900">
                No notifications
              </h3>
              <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                {filter === 'unread' 
                  ? "All caught up! No unread notifications."
                  : filter === 'archived'
                  ? "No archived notifications."
                  : "No notifications found."
                }
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {notificationsData && notificationsData.total > itemsPerPage && (
          <div className="tw-flex tw-items-center tw-justify-between tw-bg-white tw-px-4 tw-py-3 tw-border tw-border-gray-200 tw-rounded-lg">
            <div className="tw-flex tw-flex-1 tw-justify-between sm:tw-hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={(currentPage * itemsPerPage) >= notificationsData.total}
                className="tw-ml-3 tw-relative tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="tw-hidden sm:tw-flex tw-flex-1 tw-items-center tw-justify-between">
              <div>
                <p className="tw-text-sm tw-text-gray-700">
                  Showing{' '}
                  <span className="tw-font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="tw-font-medium">
                    {Math.min(currentPage * itemsPerPage, notificationsData.total)}
                  </span>
                  {' '}of{' '}
                  <span className="tw-font-medium">{notificationsData.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="tw-relative tw-z-0 tw-inline-flex tw-rounded-md tw-shadow-sm -tw-space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="tw-relative tw-inline-flex tw-items-center tw-px-2 tw-py-2 tw-rounded-l-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={(currentPage * itemsPerPage) >= notificationsData.total}
                    className="tw-relative tw-inline-flex tw-items-center tw-px-2 tw-py-2 tw-rounded-r-md tw-border tw-border-gray-300 tw-bg-white tw-text-sm tw-font-medium tw-text-gray-500 hover:tw-bg-gray-50 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </BasicAdminLayout>
  );
};

export default AdminNotificationsPage;
