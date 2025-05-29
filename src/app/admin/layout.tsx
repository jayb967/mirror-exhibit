"use client";

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from "react";
import { usePathname } from 'next/navigation';
import { Poppins } from "next/font/google";
import { StoreProvider } from '@/components/StoreProvider';
import { ToastContainer } from "react-toastify";
import { withAdminAuth } from '@/components/auth/withAuth';
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

interface AdminRootLayoutProps {
  children: React.ReactNode;
}

// Base Admin Layout Component (without auth protection)
function BaseAdminLayout({ children }: AdminRootLayoutProps) {
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

// Admin Layout Component with conditional protection
function AdminRootLayoutComponent({ children }: AdminRootLayoutProps) {
  const pathname = usePathname();

  // Don't protect the login page
  const isLoginPage = pathname === '/admin/login';

  console.log('🔍 STEP11 ADMIN LAYOUT: Pathname:', pathname, 'isLoginPage:', isLoginPage);

  if (isLoginPage) {
    console.log('🔍 STEP11 ADMIN LAYOUT: Login page - no auth protection needed');
    return <BaseAdminLayout>{children}</BaseAdminLayout>;
  }

  console.log('🔍 STEP11 ADMIN LAYOUT: Protected admin page - applying admin auth');

  // For all other admin pages, apply admin protection
  const ProtectedLayout = withAdminAuth(BaseAdminLayout);
  return <ProtectedLayout>{children}</ProtectedLayout>;
}

// Export the conditionally protected layout
export default AdminRootLayoutComponent;