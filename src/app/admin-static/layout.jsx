'use client';

import React from 'react';
import { Poppins } from 'next/font/google';

// Initialize the Poppins font
const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function StaticAdminLayout({ children }) {
  return (
    <div className={poppins.className} suppressHydrationWarning={true}>
      {children}
    </div>
  );
}
