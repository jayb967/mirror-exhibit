"use client";

import React, { useState, ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  TicketIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";

interface SimpleAdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Products", href: "/admin/products", icon: ShoppingBagIcon },
  { name: "Product Options", href: "/admin/product-options", icon: TagIcon },
  { name: "Brands", href: "/admin/brands", icon: TagIcon },
  { name: "Tags", href: "/admin/tags", icon: TagIcon },
  { name: "Orders", href: "/admin/orders", icon: ChartBarIcon },
  { name: "Users", href: "/admin/users", icon: UsersIcon },
  { name: "Guest Users", href: "/admin/guests", icon: UserGroupIcon },
  { name: "Categories", href: "/admin/categories", icon: TagIcon },
  { name: "Coupons", href: "/admin/coupons", icon: TicketIcon },
  { name: "Marketing", href: "/admin/marketing", icon: MegaphoneIcon },
  { name: "Settings", href: "/admin/settings", icon: Cog6ToothIcon },
];

// Use dynamic import with ssr: false to avoid hydration issues
const SimpleAdminLayout = ({ children }: SimpleAdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Only render navigation after component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="tw-min-h-screen tw-bg-[#F8F8F8]" suppressHydrationWarning={true}>
      {/* Mobile sidebar overlay - only render after client-side mounting */}
      {mounted && sidebarOpen && (
        <div
          className="tw-fixed tw-inset-0 tw-z-40 tw-bg-black tw-bg-opacity-50 md:tw-hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - only render after client-side mounting */}
      {mounted && (
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
                  <item.icon
                    className={`tw-mr-3 tw-h-5 tw-w-5 tw-flex-shrink-0 ${
                      isActive ? "tw-text-white" : "tw-text-gray-500 group-hover:tw-text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Header - conditionally render mobile menu button */}
      <div className="tw-flex tw-flex-col md:tw-pl-64">
        <header className="tw-py-5 tw-px-8 tw-h-[78px] tw-flex tw-items-center tw-justify-between tw-bg-white tw-shadow-sm">
          <div className="tw-flex tw-items-center tw-space-x-8">
            {mounted && (
              <div className="md:tw-hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="tw-w-10 tw-h-10 tw-leading-10 tw-text-center tw-text-black tw-border tw-border-gray-200 hover:tw-bg-[#A6A182] hover:tw-text-white hover:tw-border-[#A6A182]"
                >
                  ☰
                </button>
              </div>
            )}
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

// Export as default
export default SimpleAdminLayout;
