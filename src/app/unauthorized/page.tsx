'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useClerkAuth';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="tw-min-h-screen tw-bg-gray-50 tw-flex tw-flex-col tw-justify-center tw-py-12 sm:tw-px-6 lg:tw-px-8">
      <div className="sm:tw-mx-auto sm:tw-w-full sm:tw-max-w-md">
        <div className="tw-text-center">
          <div className="tw-mx-auto tw-h-12 tw-w-12 tw-text-red-600">
            <svg
              className="tw-h-12 tw-w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="tw-mt-6 tw-text-center tw-text-3xl tw-font-extrabold tw-text-gray-900">
            Access Denied
          </h2>
          <p className="tw-mt-2 tw-text-center tw-text-sm tw-text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="tw-mt-8 tw-bg-white tw-py-8 tw-px-4 tw-shadow sm:tw-rounded-lg sm:tw-px-10">
          <div className="tw-text-center">
            <div className="tw-mb-6">
              <p className="tw-text-sm tw-text-gray-600">
                You don't have permission to access this page. Please contact an administrator if you believe this is an error.
              </p>
            </div>

            <div className="tw-space-y-3">
              <button
                onClick={handleGoHome}
                className="tw-w-full tw-flex tw-justify-center tw-py-2 tw-px-4 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white tw-bg-black hover:tw-bg-gray-800 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-black"
              >
                Go to Homepage
              </button>

              {user && (
                <button
                  onClick={handleSignOut}
                  className="tw-w-full tw-flex tw-justify-center tw-py-2 tw-px-4 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-black"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
