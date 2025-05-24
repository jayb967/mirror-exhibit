'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { cartService, GuestUser } from '@/services/cartService';
import { toast } from 'react-toastify';

interface GuestCheckoutFormProps {
  onSubmit: (guestData: GuestUser) => void;
  onCancel: () => void;
}

const GuestCheckoutForm: React.FC<GuestCheckoutFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<GuestUser>>({
    email: '',
    first_name: '',
    last_name: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    guest_token: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State/Province is required';
    if (!formData.postal_code) newErrors.postal_code = 'Postal code is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create guest user in database
      const guestToken = cartService.getGuestToken();
      const guestData = { ...formData, guest_token: guestToken };
      const guestUser = await cartService.createGuestUser(guestData);

      if (!guestUser) {
        toast.error('Failed to create guest account');
        return;
      }

      onSubmit(guestUser);
    } catch (error) {
      console.error('Error creating guest account:', error);
      toast.error('Failed to create guest account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
      <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Guest Checkout</h2>
      <p className="tw-text-gray-600 tw-mb-6">
        You can checkout as a guest without creating an account. Just fill in your information below.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
          {/* Email */}
          <div className="md:tw-col-span-2">
            <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Email Address <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.email ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
              placeholder="your.email@example.com"
            />
            {errors.email && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.email}</p>}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="first_name" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              First Name <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.first_name ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
            />
            {errors.first_name && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.first_name}</p>}
          </div>

          <div>
            <label htmlFor="last_name" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Last Name <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.last_name ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
            />
            {errors.last_name && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.last_name}</p>}
          </div>

          {/* Address */}
          <div className="md:tw-col-span-2">
            <label htmlFor="address" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Address <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.address ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
              placeholder="Street address"
            />
            {errors.address && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.address}</p>}
          </div>

          <div className="md:tw-col-span-2">
            <label htmlFor="apartment" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Apartment, suite, etc. (optional)
            </label>
            <input
              type="text"
              id="apartment"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md"
            />
          </div>

          {/* City, State, Zip */}
          <div>
            <label htmlFor="city" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              City <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.city ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
            />
            {errors.city && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              State/Province <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.state ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
            />
            {errors.state && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="postal_code" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Postal Code <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.postal_code ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
            />
            {errors.postal_code && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.postal_code}</p>}
          </div>

          <div>
            <label htmlFor="country" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Country <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.country ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
            />
            {errors.country && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.country}</p>}
          </div>

          {/* Phone */}
          <div className="md:tw-col-span-2">
            <label htmlFor="phone" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
              Phone Number <span className="tw-text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-rounded-md ${errors.phone ? 'tw-border-red-500' : 'tw-border-gray-300'}`}
              placeholder="(123) 456-7890"
            />
            {errors.phone && <p className="tw-text-red-500 tw-text-xs tw-mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="tw-flex tw-justify-between tw-mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-text-gray-700 hover:tw-bg-gray-50"
          >
            Back to Login
          </button>

          <button
            type="submit"
            disabled={loading}
            className="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md hover:tw-bg-blue-700 disabled:tw-opacity-70"
          >
            {loading ? 'Processing...' : 'Continue to Shipping'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestCheckoutForm;
