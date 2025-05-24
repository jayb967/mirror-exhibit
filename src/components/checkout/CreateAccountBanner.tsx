'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Convert guest to user
        await cartService.convertGuestToUser(data.user.id);
        
        toast.success('Account created successfully! Please check your email to verify your account.');
        router.push('/account');
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
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
          
          {!showForm ? (
            <div className="tw-mt-4">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-text-sm tw-font-medium hover:tw-bg-blue-700 tw-transition-colors"
              >
                Create Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateAccount} className="tw-mt-4 tw-space-y-4">
              <div>
                <label htmlFor="password" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="tw-mt-1 tw-block tw-w-full tw-rounded-md tw-border-gray-300 tw-shadow-sm focus:tw-border-blue-500 focus:tw-ring-blue-500 tw-sm:text-sm"
                />
              </div>
              
              <div className="tw-flex tw-space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md tw-text-sm tw-font-medium hover:tw-bg-blue-700 tw-transition-colors disabled:tw-opacity-70"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="tw-text-blue-600 tw-px-4 tw-py-2 tw-rounded-md tw-text-sm tw-font-medium hover:tw-bg-blue-50 tw-transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAccountBanner;
