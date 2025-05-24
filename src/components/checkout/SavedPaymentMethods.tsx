'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/utils/supabase-client';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface SavedPaymentMethod {
  id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
  created_at: string;
}

interface SavedPaymentMethodsProps {
  onSelect: (paymentMethodId: string) => void;
  onAddNew: () => void;
}

const SavedPaymentMethods: React.FC<SavedPaymentMethodsProps> = ({ onSelect, onAddNew }) => {
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  // Fetch saved payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setPaymentMethods([]);
          return;
        }
        
        // Fetch payment methods from database
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPaymentMethods(data || []);
        
        // Select default payment method if available
        const defaultMethod = data?.find(method => method.is_default);
        if (defaultMethod) {
          setSelectedId(defaultMethod.id);
          onSelect(defaultMethod.id);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        toast.error('Failed to load saved payment methods');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, [supabase, onSelect]);

  // Handle payment method selection
  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelect(id);
  };

  // Get card brand logo
  const getCardLogo = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '/assets/img/payment/visa.svg';
      case 'mastercard':
        return '/assets/img/payment/mastercard.svg';
      case 'amex':
        return '/assets/img/payment/amex.svg';
      case 'discover':
        return '/assets/img/payment/discover.svg';
      default:
        return '/assets/img/payment/generic-card.svg';
    }
  };

  // Format expiration date
  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  // Check if card is expired
  const isExpired = (month: number, year: number) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();
    
    return (year < currentYear) || (year === currentYear && month < currentMonth);
  };

  if (loading) {
    return (
      <div className="tw-animate-pulse tw-space-y-3">
        <div className="tw-h-12 tw-bg-gray-200 tw-rounded"></div>
        <div className="tw-h-12 tw-bg-gray-200 tw-rounded"></div>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="tw-text-center tw-py-4">
        <p className="tw-text-gray-600 tw-mb-4">No saved payment methods</p>
        <button
          type="button"
          onClick={onAddNew}
          className="tw-text-blue-600 hover:tw-text-blue-800 tw-font-medium"
        >
          Add a new payment method
        </button>
      </div>
    );
  }

  return (
    <div className="tw-space-y-4">
      <h3 className="tw-text-lg tw-font-medium">Saved Payment Methods</h3>
      
      <div className="tw-space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`tw-border tw-rounded-md tw-p-3 tw-flex tw-items-center tw-cursor-pointer hover:tw-bg-gray-50 ${
              selectedId === method.id ? 'tw-border-blue-500 tw-bg-blue-50' : 'tw-border-gray-300'
            }`}
            onClick={() => handleSelect(method.id)}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedId === method.id}
              onChange={() => handleSelect(method.id)}
              className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300"
            />
            
            <div className="tw-ml-3 tw-flex tw-flex-1 tw-items-center">
              <div className="tw-h-8 tw-w-12 tw-relative tw-mr-3">
                <Image
                  src={getCardLogo(method.card_brand)}
                  alt={method.card_brand}
                  width={48}
                  height={32}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              
              <div>
                <p className="tw-font-medium">
                  {method.card_brand} •••• {method.card_last4}
                  {method.is_default && (
                    <span className="tw-ml-2 tw-text-xs tw-bg-gray-200 tw-px-2 tw-py-1 tw-rounded">
                      Default
                    </span>
                  )}
                </p>
                <p className="tw-text-sm tw-text-gray-500">
                  Expires {formatExpiry(method.card_exp_month, method.card_exp_year)}
                  {isExpired(method.card_exp_month, method.card_exp_year) && (
                    <span className="tw-ml-2 tw-text-xs tw-text-red-600">Expired</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="tw-pt-2">
        <button
          type="button"
          onClick={onAddNew}
          className="tw-text-blue-600 hover:tw-text-blue-800 tw-font-medium tw-flex tw-items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="tw-h-5 tw-w-5 tw-mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add a new payment method
        </button>
      </div>
    </div>
  );
};

export default SavedPaymentMethods;
