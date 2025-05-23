'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useClerkAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  BellIcon,
  CheckIcon,
  ArchiveBoxIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Notification {
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
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notificationsData, setNotificationsData] = useState<NotificationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, filter, currentPage]);

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
      } else if (filter === 'archived') {
        params.append('include_archived', 'true');
      }

      const response = await fetch(`/api/notifications?${params}`);
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

  const archiveNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_confirmation':
      case 'order_status_update':
        return <CheckIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
      case 'shipping_notification':
      case 'delivery_confirmation':
        return <BellIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
      default:
        return <BellIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
    }
  };

  if (loading && !notificationsData) {
    return (
      <DashboardLayout>
        <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2" style={{ borderColor: '#A6A182' }}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="tw-space-y-6">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-justify-between">
          <div>
            <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">Notifications</h1>
            <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
              Stay updated on your orders and account activity
            </p>
          </div>
          {notificationsData && notificationsData.unreadCount > 0 && (
            <div className="tw-flex tw-items-center tw-space-x-2">
              <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-text-white" style={{ backgroundColor: '#A6A182' }}>
                {notificationsData.unreadCount} unread
              </span>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="tw-border-b tw-border-gray-200">
          <nav className="tw--mb-px tw-flex tw-space-x-8">
            {[
              { key: 'all', label: 'All Notifications' },
              { key: 'unread', label: 'Unread' },
              { key: 'archived', label: 'Archived' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(tab.key as any);
                  setCurrentPage(1);
                }}
                className={`
                  tw-py-2 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm tw-transition-colors
                  ${filter === tab.key
                    ? 'tw-border-current tw-text-gray-900'
                    : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }
                `}
                style={filter === tab.key ? { borderColor: '#A6A182', color: '#A6A182' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </nav>
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
                          <p className="tw-mt-2 tw-text-xs tw-text-gray-500">
                            {formatDate(notification.created_at)}
                          </p>
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
                          
                          {!notification.is_archived && (
                            <button
                              onClick={() => archiveNotification(notification.id)}
                              className="tw-p-1 tw-text-gray-400 hover:tw-text-gray-600 tw-transition-colors"
                              title="Archive"
                            >
                              <ArchiveBoxIcon className="tw-h-4 tw-w-4" />
                            </button>
                          )}
                          
                          {notification.action_url && (
                            <Link
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
                            </Link>
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
                  ? "You're all caught up! No unread notifications."
                  : filter === 'archived'
                  ? "No archived notifications."
                  : "You don't have any notifications yet."
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
    </DashboardLayout>
  );
};

export default NotificationsPage;
