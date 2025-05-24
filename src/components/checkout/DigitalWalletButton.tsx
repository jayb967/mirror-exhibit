'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentRequest,
  StripePaymentRequestButtonElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

// Load Stripe outside of component to avoid recreating it on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface DigitalWalletButtonProps {
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentMethod: any) => void;
  onPaymentError: (error: any) => void;
  customerEmail?: string;
  customerName?: string;
  shippingAddress?: any;
  disabled?: boolean;
}

const DigitalWalletButtonContent: React.FC<DigitalWalletButtonProps> = ({
  amount,
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError,
  customerEmail,
  customerName,
  shippingAddress,
  disabled = false
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) return;

    // Create payment request
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: currency.toLowerCase(),
      total: {
        label: 'Mirror Exhibit Order',
        amount: Math.round(amount * 100), // Convert to cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
      shippingOptions: [
        {
          id: 'standard',
          label: 'Standard Shipping',
          detail: '5-7 business days',
          amount: 0,
        },
        {
          id: 'express',
          label: 'Express Shipping',
          detail: '2-3 business days',
          amount: 1500, // $15.00
        },
      ],
    });

    // Pre-fill with customer data if available
    if (customerEmail || customerName || shippingAddress) {
      pr.update({
        total: {
          label: 'Mirror Exhibit Order',
          amount: Math.round(amount * 100),
        },
        shippingOptions: [
          {
            id: 'standard',
            label: 'Standard Shipping',
            detail: '5-7 business days',
            amount: 0,
          },
          {
            id: 'express',
            label: 'Express Shipping',
            detail: '2-3 business days',
            amount: 1500,
          },
        ],
      });
    }

    // Check if payment request is available
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      } else {
        setCanMakePayment(false);
      }
    });

    // Handle payment method
    pr.on('paymentmethod', async (e) => {
      try {
        onPaymentSuccess(e.paymentMethod);
      } catch (error) {
        onPaymentError(error);
        e.complete('fail');
      }
    });

    // Handle shipping address change
    pr.on('shippingaddresschange', (e) => {
      // Validate the shipping address here if needed
      e.updateWith({ status: 'success' });
    });

    // Handle shipping option change
    pr.on('shippingoptionchange', (e) => {
      const selectedOption = e.shippingOption;
      
      // Update total based on shipping option
      const newAmount = Math.round(amount * 100) + (selectedOption?.amount || 0);
      
      e.updateWith({
        status: 'success',
        total: {
          label: 'Mirror Exhibit Order',
          amount: newAmount,
        },
      });
    });

    return () => {
      // Clean up event listeners
      pr.off('paymentmethod');
      pr.off('shippingaddresschange');
      pr.off('shippingoptionchange');
    };
  }, [stripe, elements, amount, currency, onPaymentSuccess, onPaymentError, customerEmail, customerName, shippingAddress]);

  if (!canMakePayment || !paymentRequest || disabled) {
    return null;
  }

  return (
    <div className="tw-mb-4">
      <StripePaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'buy', // 'default' | 'donate' | 'buy'
              theme: 'dark', // 'dark' | 'light' | 'light-outline'
              height: '48px',
            },
          },
        }}
      />
      <p className="tw-text-xs tw-text-center tw-text-gray-500 tw-mt-2">
        Pay faster with Apple Pay or Google Pay
      </p>
    </div>
  );
};

const DigitalWalletButton: React.FC<DigitalWalletButtonProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <DigitalWalletButtonContent {...props} />
    </Elements>
  );
};

export default DigitalWalletButton;
