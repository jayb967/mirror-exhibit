"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  TicketIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/admin/orders', icon: ChartBarIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Guest Users', href: '/admin/guests', icon: UserGroupIcon },
  { name: 'Categories', href: '/admin/categories', icon: TagIcon },
  { name: 'Coupons', href: '/admin/coupons', icon: TicketIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

const supabase = createClient();

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close sidebar when screen becomes larger
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1024) {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="tw-min-h-screen tw-bg-[#F8F8F8]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="tw-fixed tw-inset-0 tw-z-40 tw-bg-black tw-bg-opacity-50 md:tw-hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`tw-fixed tw-inset-y-0 tw-left-0 tw-w-64 tw-bg-white tw-shadow-md tw-z-50 tw-transform tw-transition-transform md:tw-translate-x-0 tw-overflow-y-auto tw-h-full
        ${sidebarOpen ? 'tw-translate-x-0' : '-tw-translate-x-full md:tw-translate-x-0'}`}>
        <div className="tw-flex tw-h-16 tw-items-center tw-justify-center tw-border-b tw-border-gray-200">
          <h1 className="tw-text-xl tw-font-bold tw-text-black">Mirror Exhibit Admin</h1>
        </div>
        <nav className="tw-mt-5 tw-px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`tw-group tw-flex tw-items-center tw-px-2 tw-py-2 tw-text-[16px] tw-font-medium ${
                  isActive
                    ? 'tw-bg-black tw-text-white'
                    : 'tw-text-gray-600 hover:tw-bg-[#A6A182] hover:tw-text-white'
                }`}
              >
                <item.icon
                  className={`tw-mr-3 tw-h-5 tw-w-5 tw-flex-shrink-0 ${
                    isActive ? 'tw-text-white' : 'tw-text-gray-500 group-hover:tw-text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="tw-absolute tw-bottom-0 tw-w-full tw-p-4">
          <button
            onClick={handleSignOut}
            className="tw-flex tw-w-full tw-items-center tw-px-2 tw-py-2 tw-text-[16px] tw-font-medium tw-text-gray-600 hover:tw-bg-[#A6A182] hover:tw-text-white"
          >
            <ArrowLeftOnRectangleIcon className="tw-mr-3 tw-h-5 tw-w-5 tw-flex-shrink-0 tw-text-gray-500 group-hover:tw-text-white" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="tw-flex tw-flex-col md:tw-pl-64">
        <Header setSideMenu={setSidebarOpen} />
        <main className="tw-py-6">
          <div className="tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
