"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Note: Using JSX instead of TSX to avoid potential type-related issues
// Also using direct imports instead of dynamic imports

const BasicAdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Only render navigation after component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simple navigation without icon components to avoid potential circular dependencies
  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Products", href: "/admin/products" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Users", href: "/admin/users" },
    { name: "Guest Users", href: "/admin/guests" },
    { name: "Categories", href: "/admin/categories" },
    { name: "Coupons", href: "/admin/coupons" },
    { name: "Settings", href: "/admin/settings" },
  ];

  if (!mounted) {
    // Return a simple loading state or placeholder when not mounted
    return (
      <div className="tw-min-h-screen tw-bg-[#F8F8F8] tw-flex tw-justify-center tw-items-center">
        <div className="tw-text-center">
          <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent tw-rounded-full tw-mx-auto"></div>
          <p className="tw-mt-4 tw-text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-min-h-screen tw-bg-[#F8F8F8]" suppressHydrationWarning={true}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="tw-fixed tw-inset-0 tw-z-40 tw-bg-black tw-bg-opacity-50 md:tw-hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`tw-fixed tw-inset-y-0 tw-left-0 tw-w-64 tw-bg-white tw-shadow-md tw-z-50 tw-transform tw-transition-transform md:tw-translate-x-0 tw-overflow-y-auto tw-h-full ${
          sidebarOpen ? "tw-translate-x-0" : "-tw-translate-x-full md:tw-translate-x-0"
        }`}
      >
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
                    ? "tw-bg-black tw-text-white"
                    : "tw-text-gray-600 hover:tw-bg-[#A6A182] hover:tw-text-white"
                }`}
              >
                {/* Simple text icon instead of SVG component */}
                <span className="tw-mr-3 tw-w-5 tw-h-5 tw-flex-shrink-0 tw-flex tw-items-center tw-justify-center">
                  {item.name.charAt(0)}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Header */}
      <div className="tw-flex tw-flex-col md:tw-pl-64">
        <header className="tw-py-5 tw-px-8 tw-h-[78px] tw-flex tw-items-center tw-justify-between tw-bg-white tw-shadow-sm">
          <div className="tw-flex tw-items-center tw-space-x-8">
            <div className="md:tw-hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="tw-w-10 tw-h-10 tw-leading-10 tw-text-center tw-text-black tw-border tw-border-gray-200 hover:tw-bg-[#A6A182] hover:tw-text-white hover:tw-border-[#A6A182]"
              >
                ☰
              </button>
            </div>
            <div className="tw-hidden md:tw-block">
              <h2 className="tw-text-lg tw-font-medium">Admin Dashboard</h2>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="tw-py-6">
          <div className="tw-mx-auto tw-max-w-7xl tw-px-4 sm:tw-px-6 lg:tw-px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BasicAdminLayout;
