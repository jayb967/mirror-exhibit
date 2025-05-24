'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import { cartService } from '@/services/cartService';

interface CreateAccountBannerProps {
  guestToken: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Component that allows guest users to create an account after checkout
 */
const CreateAccountBanner: React.FC<CreateAccountBannerProps> = ({
  guestToken,
  email,
  firstName,
  lastName
}) => {
  const [showForm, setShowForm] = useState(false);

  const router = useRouter();
  const { openSignUp } = useClerk();

  const handleCreateAccount = () => {
    // Open Clerk sign-up modal with pre-filled email
    openSignUp({
      initialValues: {
        emailAddress: email,
        firstName: firstName,
        lastName: lastName,
      },
      redirectUrl: '/account',
    });
  };

  return (
    <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-6 tw-mb-8">
      <div className="tw-flex tw-items-start">
        <div className="tw-flex-shrink-0">
          <svg className="tw-h-6 tw-w-6 tw-text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="tw-ml-3 tw-flex-1">
          <h3 className="tw-text-lg tw-font-medium tw-text-blue-800">Create an Account</h3>
          <div className="tw-mt-2 tw-text-sm tw-text-blue-700">
            <p>
              Create an account to track your orders, save your shipping information, and enjoy a faster checkout experience in the future.
            </p>
          </div>

          <div className="tw-mt-4">
            <button
              type="button"
              onClick={handleCreateAccount}
              className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-text-sm tw-font-medium hover:tw-bg-blue-700 tw-transition-colors"
            >
              Create Account with Clerk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountBanner;
