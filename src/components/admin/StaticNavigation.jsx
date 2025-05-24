'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function StaticNavigation({ currentPath }) {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin-static' },
    { name: 'Products', href: '/admin-static/products' },
    { name: 'Orders', href: '/admin-static/orders' },
    { name: 'Users', href: '/admin-static/users' },
    { name: 'Settings', href: '/admin-static/settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="tw-md:hidden tw-p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-border tw-border-gray-300"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="tw-fixed tw-inset-0 tw-z-50 tw-bg-black tw-bg-opacity-50 tw-md:hidden">
          <div className="tw-bg-white tw-w-64 tw-h-full tw-p-4">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
              <h2 className="tw-text-lg tw-font-bold">Admin Menu</h2>
              <button onClick={() => setIsOpen(false)} className="tw-text-xl">×</button>
            </div>
            <nav>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`tw-block tw-py-2 tw-px-4 tw-mb-2 tw-text-[16px] ${
                    currentPath === item.href
                      ? 'tw-bg-black tw-text-white'
                      : 'tw-text-gray-700 hover:tw-bg-[#A6A182] hover:tw-text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="tw-hidden tw-md:block tw-w-64 tw-bg-white tw-shadow-md tw-h-screen tw-fixed tw-left-0 tw-top-0">
        <div className="tw-p-6 tw-border-b tw-border-gray-200">
          <h1 className="tw-text-xl tw-font-bold">Mirror Exhibit Admin</h1>
        </div>
        <nav className="tw-p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`tw-block tw-py-2 tw-px-4 tw-mb-2 tw-text-[16px] ${
                currentPath === item.href
                  ? 'tw-bg-black tw-text-white'
                  : 'tw-text-gray-700 hover:tw-bg-[#A6A182] hover:tw-text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
