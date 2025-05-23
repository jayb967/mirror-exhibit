'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useClerkAuth';
import {
  HomeIcon,
  ShoppingBagIcon,
  BellIcon,
  UserIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBagIcon },
  { name: 'Notifications', href: '/dashboard/notifications', icon: BellIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="tw-min-h-screen tw-bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="tw-fixed tw-inset-0 tw-z-40 tw-bg-black tw-bg-opacity-50 lg:tw-hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        tw-fixed tw-inset-y-0 tw-left-0 tw-z-50 tw-w-64 tw-bg-white tw-shadow-lg tw-transform tw-transition-transform tw-duration-300 tw-ease-in-out
        ${sidebarOpen ? 'tw-translate-x-0' : '-tw-translate-x-full'}
        lg:tw-translate-x-0 lg:tw-static lg:tw-inset-0
      `}>
        <div className="tw-flex tw-items-center tw-justify-between tw-h-16 tw-px-6 tw-border-b tw-border-gray-200">
          <Link href="/" className="tw-flex tw-items-center">
            <span className="tw-text-xl tw-font-bold" style={{ color: '#A6A182' }}>
              Mirror Exhibit
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="tw-p-2 tw-rounded-md tw-text-gray-400 hover:tw-text-gray-500 lg:tw-hidden"
          >
            <XMarkIcon className="tw-h-6 tw-w-6" />
          </button>
        </div>

        <nav className="tw-mt-8 tw-px-4">
          <ul className="tw-space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      tw-group tw-flex tw-items-center tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-rounded-md tw-transition-colors
                      ${isActive
                        ? 'tw-text-white tw-shadow-sm'
                        : 'tw-text-gray-700 hover:tw-text-gray-900 hover:tw-bg-gray-50'
                      }
                    `}
                    style={isActive ? { backgroundColor: '#A6A182' } : {}}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`
                        tw-mr-3 tw-h-5 tw-w-5 tw-flex-shrink-0
                        ${isActive ? 'tw-text-white' : 'group-hover:tw-text-gray-500'}
                      `}
                      style={!isActive ? { color: '#A6A182' } : {}}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info at bottom */}
        <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-p-4 tw-border-t tw-border-gray-200">
          <div className="tw-flex tw-items-center tw-space-x-3">
            <div className="tw-flex-shrink-0">
              <div className="tw-w-8 tw-h-8 tw-bg-gray-300 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                <UserIcon className="tw-h-5 tw-w-5 tw-text-gray-600" />
              </div>
            </div>
            <div className="tw-flex-1 tw-min-w-0">
              <p className="tw-text-sm tw-font-medium tw-text-gray-900 tw-truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="tw-text-xs tw-text-gray-500 tw-truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="tw-mt-3 tw-w-full tw-text-left tw-text-sm tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:tw-pl-64">
        {/* Top bar */}
        <div className="tw-bg-white tw-shadow-sm tw-border-b tw-border-gray-200">
          <div className="tw-flex tw-items-center tw-justify-between tw-h-16 tw-px-4 sm:tw-px-6 lg:tw-px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="tw-p-2 tw-rounded-md tw-text-gray-400 hover:tw-text-gray-500 lg:tw-hidden"
            >
              <Bars3Icon className="tw-h-6 tw-w-6" />
            </button>

            <div className="tw-flex tw-items-center tw-space-x-4">
              <Link
                href="/"
                className="tw-text-sm tw-text-gray-500 hover:tw-text-gray-700 tw-transition-colors"
              >
                ← Back to Store
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="tw-flex-1">
          <div className="tw-py-6">
            <div className="tw-max-w-7xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
