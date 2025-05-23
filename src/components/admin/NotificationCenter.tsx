'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
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
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
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

      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin_new_order':
        return <ShoppingBagIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
      case 'admin_system_alert':
        return <ExclamationTriangleIcon className="tw-h-5 tw-w-5 tw-text-yellow-500" />;
      case 'admin_low_stock':
        return <ExclamationTriangleIcon className="tw-h-5 tw-w-5 tw-text-red-500" />;
      default:
        return <InformationCircleIcon className="tw-h-5 tw-w-5" style={{ color: '#A6A182' }} />;
    }
  };

  return (
    <div className={`tw-relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="tw-relative tw-p-2 tw-text-gray-600 hover:tw-text-gray-900 tw-transition-colors"
      >
        <BellIcon className="tw-h-6 tw-w-6" />
        {unreadCount > 0 && (
          <span className="tw-absolute tw-top-0 tw-right-0 tw-inline-flex tw-items-center tw-justify-center tw-px-2 tw-py-1 tw-text-xs tw-font-bold tw-leading-none tw-text-white tw-transform tw-translate-x-1/2 -tw-translate-y-1/2 tw-rounded-full" style={{ backgroundColor: '#A6A182' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="tw-fixed tw-inset-0 tw-z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="tw-absolute tw-right-0 tw-mt-2 tw-w-96 tw-bg-white tw-rounded-lg tw-shadow-lg tw-border tw-border-gray-200 tw-z-50 tw-max-h-96 tw-overflow-hidden">
            {/* Header */}
            <div className="tw-px-4 tw-py-3 tw-border-b tw-border-gray-200 tw-flex tw-items-center tw-justify-between">
              <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">
                Notifications
              </h3>
              <div className="tw-flex tw-items-center tw-space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="tw-text-sm tw-font-medium tw-transition-colors disabled:tw-opacity-50"
                    style={{ color: '#A6A182' }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="tw-p-1 tw-text-gray-400 hover:tw-text-gray-600"
                >
                  <XMarkIcon className="tw-h-4 tw-w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="tw-max-h-80 tw-overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      tw-px-4 tw-py-3 tw-border-b tw-border-gray-100 tw-transition-colors tw-cursor-pointer
                      ${!notification.is_read ? 'tw-bg-gray-50' : 'tw-bg-white hover:tw-bg-gray-50'}
                    `}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                      if (notification.action_url) {
                        window.location.href = notification.action_url;
                      }
                    }}
                  >
                    <div className="tw-flex tw-items-start tw-space-x-3">
                      <div className="tw-flex-shrink-0 tw-mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="tw-flex-1 tw-min-w-0">
                        <div className="tw-flex tw-items-center tw-justify-between">
                          <p className={`
                            tw-text-sm tw-font-medium tw-truncate
                            ${!notification.is_read ? 'tw-text-gray-900' : 'tw-text-gray-700'}
                          `}>
                            {notification.title}
                          </p>
                          <div className="tw-flex tw-items-center tw-space-x-2">
                            <span className="tw-text-xs tw-text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <div className="tw-w-2 tw-h-2 tw-rounded-full" style={{ backgroundColor: '#A6A182' }}></div>
                            )}
                          </div>
                        </div>
                        <p className="tw-mt-1 tw-text-sm tw-text-gray-600 tw-line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="tw-px-4 tw-py-8 tw-text-center">
                  <BellIcon className="tw-mx-auto tw-h-8 tw-w-8 tw-text-gray-400" />
                  <p className="tw-mt-2 tw-text-sm tw-text-gray-500">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="tw-px-4 tw-py-3 tw-border-t tw-border-gray-200 tw-bg-gray-50">
                <a
                  href="/admin/notifications"
                  className="tw-block tw-text-sm tw-font-medium tw-text-center tw-transition-colors"
                  style={{ color: '#A6A182' }}
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
