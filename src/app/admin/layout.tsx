"use client";

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from "react";
import { Poppins } from "next/font/google";
import { StoreProvider } from '@/components/StoreProvider';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  const [mounted, setMounted] = React.useState(false);

  // Prevent rendering during static generation
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during static generation
  if (!mounted) {
    return null;
  }

  // Use Redux Provider only - no more CartContext
  return (
    <StoreProvider>
      <div className={poppins.className} suppressHydrationWarning={true}>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </StoreProvider>
  );
}