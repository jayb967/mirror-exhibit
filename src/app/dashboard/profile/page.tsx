'use client';

import React from 'react';
import { UserProfile } from '@clerk/nextjs';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const ProfilePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="tw-space-y-6">
        {/* Header */}
        <div>
          <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">Profile Settings</h1>
          <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        {/* Clerk User Profile Component */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
          <div className="tw-p-6">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: "tw-w-full",
                  card: "tw-shadow-none tw-border-0",
                  navbar: "tw-hidden",
                  pageScrollBox: "tw-p-0",
                  page: "tw-bg-transparent",
                  formButtonPrimary: {
                    backgroundColor: '#A6A182',
                    '&:hover': {
                      backgroundColor: '#959070'
                    }
                  },
                  formFieldInput: {
                    borderColor: '#A6A182',
                    '&:focus': {
                      borderColor: '#A6A182',
                      boxShadow: '0 0 0 1px #A6A182'
                    }
                  },
                  identityPreviewEditButton: {
                    color: '#A6A182'
                  },
                  profileSectionPrimaryButton: {
                    backgroundColor: '#A6A182',
                    '&:hover': {
                      backgroundColor: '#959070'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
