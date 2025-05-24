'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Define form schema
const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  orderId: yup.string().required('Order ID is required')
}).required();

type FormData = {
  email: string;
  orderId: string;
};

export default function TrackOrderPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema)
  });
  
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      // Call the API to verify the order
      const response = await fetch('/api/guest/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          orderId: data.orderId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to find order');
      }
      
      // Redirect to order details page
      router.push(`/order/${data.orderId}?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to find order');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-12 tw-max-w-2xl">
      <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-8">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-6 tw-text-center">Track Your Order</h1>
        
        <p className="tw-text-gray-600 tw-mb-8 tw-text-center">
          Enter your email address and order ID to track your order status.
        </p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="tw-space-y-6">
          <div>
            <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-md ${errors.email ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
              placeholder="Enter the email used for your order"
            />
            {errors.email && (
              <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="orderId" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Order ID
            </label>
            <input
              type="text"
              id="orderId"
              {...register('orderId')}
              className={`tw-w-full tw-px-4 tw-py-2 tw-border tw-rounded-md ${errors.orderId ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
              placeholder="Enter your order ID (e.g., ORD-1234-5678)"
            />
            {errors.orderId && (
              <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.orderId.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="tw-w-full tw-bg-blue-600 tw-text-white tw-py-2 tw-px-4 tw-rounded-md tw-font-medium hover:tw-bg-blue-700 tw-transition-colors tw-duration-300 disabled:tw-opacity-70"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>
        
        <div className="tw-mt-8 tw-text-center tw-text-sm tw-text-gray-500">
          <p>
            If you created an account, you can view all your orders in your{' '}
            <a href="/account/orders" className="tw-text-blue-600 hover:tw-underline">
              account dashboard
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
