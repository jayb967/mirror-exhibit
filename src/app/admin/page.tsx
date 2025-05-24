'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useClerkAuth';
import BasicAdminLayout from '@/components/admin/BasicAdminLayout';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    setMounted(true);

    async function checkAuth() {
      try {
        if (!isAuthenticated) {
          // If not authenticated, the middleware will handle the redirect to login
          return;
        }

        if (!isAdmin) {
          // If not admin, redirect to unauthorized
          router.push('/unauthorized');
          return;
        }

        // If authenticated and admin, redirect to dashboard
        router.push('/admin/dashboard');
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Error checking authentication. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router, isAuthenticated, isAdmin]);

  // Only render after client-side mounting to prevent hydration errors
  if (!mounted) {
    return null;
  }

  return (
    <BasicAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-bg-white tw-p-6 tw-shadow-sm">
          <h1 className="tw-text-2xl tw-font-bold tw-mb-6">Admin Dashboard</h1>

          {loading ? (
            <div className="tw-flex tw-justify-center tw-items-center tw-py-12">
              <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent tw-rounded-full"></div>
            </div>
          ) : error ? (
            <div className="tw-bg-red-50 tw-p-4 tw-text-red-800 tw-rounded">
              {error}
            </div>
          ) : (
            <div className="tw-text-center tw-py-8">
              <p className="tw-text-gray-600">Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </BasicAdminLayout>
  );
}
