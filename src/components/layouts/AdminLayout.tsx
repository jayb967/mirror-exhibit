"use client";

import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Products', href: '/admin/products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { name: 'Import Products', href: '/admin/products/import', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { name: 'Import Shopify', href: '/admin/products/import-shopify', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
    { name: 'Orders', href: '/admin/orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { name: 'Users', href: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'SEO Settings', href: '/admin/seo', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Settings', href: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="tw-flex tw-h-screen tw-bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="tw-fixed tw-inset-0 tw-z-40 tw-bg-gray-600 tw-bg-opacity-75 md:tw-hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`tw-fixed tw-z-50 tw-w-64 tw-h-full tw-bg-gray-800 tw-transform tw-transition-transform md:tw-relative md:tw-translate-x-0 ${
        sidebarOpen ? 'tw-translate-x-0' : 'tw--translate-x-full'
      } md:tw-block`}>
        <div className="tw-flex tw-items-center tw-justify-center tw-h-16 tw-bg-gray-900">
          <span className="tw-text-white tw-text-xl tw-font-semibold">Mirror Exhibit Admin</span>
        </div>
        <nav className="tw-mt-5 tw-px-2">
          <div className="tw-space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`tw-group tw-flex tw-items-center tw-px-2 tw-py-2 tw-text-[16px] tw-font-medium tw-rounded-md ${
                    isActive
                      ? 'tw-bg-gray-900 tw-text-white'
                      : 'tw-text-gray-300 hover:tw-bg-gray-700 hover:tw-text-white'
                  }`}
                >
                  <svg
                    className={`tw-mr-3 tw-h-6 tw-w-6 ${
                      isActive ? 'tw-text-white' : 'tw-text-gray-400 group-hover:tw-text-gray-300'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="tw-flex tw-flex-col tw-flex-1 tw-overflow-hidden">
        {/* Top header */}
        <header className="tw-bg-white tw-shadow tw-sticky tw-top-0 tw-z-10">
          <div className="tw-flex tw-items-center tw-justify-between tw-h-16 tw-px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="tw-text-gray-500 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-inset focus:tw-ring-blue-500 md:tw-hidden"
            >
              <svg
                className="tw-h-6 tw-w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="tw-flex tw-items-center">
              <Link href="/" className="tw-text-blue-600 hover:tw-underline tw-mr-4">
                View Site
              </Link>
              <span className="tw-h-6 tw-w-px tw-bg-gray-300 tw-mx-3" aria-hidden="true"></span>
              <Link
                href="/api/auth/signout"
                className="tw-text-gray-500 hover:tw-text-gray-700"
              >
                Sign out
              </Link>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="tw-flex-1 tw-overflow-y-auto">
          {children}
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}