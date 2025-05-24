'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { cartService, GuestUser } from '@/services/cartService';
import { shippingService, ShippingOption, ShippingAddress } from '@/services/shippingService';
import { taxService, TaxAddress } from '@/services/taxService';
import { cartTrackingService } from '@/services/cartTrackingService';
import { couponService, Coupon } from '@/services/couponService';
import {
  ENABLE_ENHANCED_CHECKOUT,
  ENABLE_SAVED_ADDRESSES,
  ENABLE_SAVED_PAYMENT_METHODS,
  ENABLE_DIGITAL_WALLET,
  ENABLE_ADDRESS_VALIDATION,
  ENABLE_COUPONS
} from '@/config/featureFlags';
import GuestCheckoutForm from './GuestCheckoutForm';
import CartValidation from '@/components/cart/CartValidation';
import OrderSummary from '@/components/checkout/OrderSummary';
import AddressAutofill, { AddressData } from '@/components/checkout/AddressAutofill';
import DigitalWalletButton from '@/components/checkout/DigitalWalletButton';
import SavedPaymentMethods from '@/components/checkout/SavedPaymentMethods';
import OneClickCheckout from '@/components/checkout/OneClickCheckout';
import ShippingOptions from '@/components/checkout/ShippingOptions';
import SavedAddresses from '@/components/checkout/SavedAddresses';
import AddressValidator from '@/components/checkout/AddressValidator';
import CouponForm from '@/components/checkout/CouponForm';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  saveInfo: boolean;
}

const CheckoutPage = () => {
  const { cartItems, subtotal, tax, total } = useCart();
  const [loading, setLoading] = useState(true);
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('standard');
  const [taxBreakdown, setTaxBreakdown] = useState({ taxRate: 0, taxAmount: 0, taxDescription: 'Tax' });
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [isCartValid, setIsCartValid] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [useAddressAutofill, setUseAddressAutofill] = useState(false);
  const [showSavedPaymentMethods, setShowSavedPaymentMethods] = useState(false);
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(false);
  const [digitalWalletPaymentMethod, setDigitalWalletPaymentMethod] = useState<any>(null);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [addressValidated, setAddressValidated] = useState(false);
  const router = useRouter();

  const supabase = createClientComponentClient();

  // Initial form data
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    saveInfo: true
  });

  // Check authentication and load user data
  useEffect(() => {
    async function checkAuthAndLoadData() {
      try {
        setLoading(true);

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);

        if (user) {
          // Get user profile if available
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            // Populate form with user profile data
            setFormData(prevState => ({
              ...prevState,
              email: user.email || '',
              firstName: profile.first_name || '',
              lastName: profile.last_name || '',
              address: profile.address || '',
              apartment: profile.apartment || '',
              city: profile.city || '',
              state: profile.state || '',
              postalCode: profile.postal_code || '',
              country: profile.country || 'US',
              phone: profile.phone || ''
            }));
          } else {
            // Just set email if profile doesn't exist
            setFormData(prevState => ({
              ...prevState,
              email: user.email || ''
            }));
          }

          // Check if user has saved payment methods
          const { data: paymentMethods, error: paymentError } = await supabase
            .from('payment_methods')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          if (!paymentError && paymentMethods && paymentMethods.length > 0) {
            setShowSavedPaymentMethods(true);
          } else {
            setShowSavedPaymentMethods(false);
            setUseNewPaymentMethod(true);
          }

          // Check if user has saved addresses
          const { data: addresses, error: addressesError } = await supabase
            .from('shipping_addresses')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          if (!addressesError && addresses && addresses.length > 0) {
            setShowSavedAddresses(true);
            setUseNewAddress(false);
          } else {
            setShowSavedAddresses(false);
            setUseNewAddress(true);
          }
        } else {
          // Check if we have a guest user
          const guest = await cartService.getGuestUser();
          if (guest) {
            setGuestUser(guest);
            setFormData(prevState => ({
              ...prevState,
              email: guest.email || '',
              firstName: guest.first_name || '',
              lastName: guest.last_name || '',
              address: guest.address || '',
              apartment: guest.apartment || '',
              city: guest.city || '',
              state: guest.state || '',
              postalCode: guest.postal_code || '',
              country: guest.country || 'US',
              phone: guest.phone || ''
            }));
          }

          // Guest users always use new payment method
          setShowSavedPaymentMethods(false);
          setUseNewPaymentMethod(true);
        }

        // Get shipping options
        try {
          // Create shipping address from form data
          const shippingAddress: ShippingAddress = {
            country: formData.country,
            state: formData.state,
            city: formData.city,
            postalCode: formData.postalCode,
            address: formData.address,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            email: formData.email
          };

          // Get shipping options asynchronously
          const options = await shippingService.getShippingOptions(shippingAddress, cartItems);
          setShippingOptions(options);

          // Set initial shipping cost
          const initialShippingCost = await shippingService.calculateShippingCost(
            cartItems,
            'standard',
            shippingAddress
          );
          setShippingCost(initialShippingCost);

          // Check for free shipping eligibility
          const isEligible = await shippingService.isEligibleForFreeShipping(
            subtotal,
            cartItems,
            shippingAddress
          );

          if (isEligible && selectedShippingOption === 'standard') {
            setShippingCost(0);
          }
        } catch (error) {
          console.error('Error fetching shipping options:', error);
          // Fallback to standard options
          const options = shippingService.getFallbackShippingOptions({ country: formData.country });
          setShippingOptions(options);
        }

        // Track cart for abandoned cart recovery
        if (cartItems.length > 0) {
          await cartTrackingService.trackCart(cartItems, subtotal);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndLoadData();
  }, [supabase, cartItems, subtotal, selectedShippingOption]);

  // Calculate tax when address or cart changes
  useEffect(() => {
    // Create tax address from form data
    const taxAddress: TaxAddress = {
      country: formData.country,
      state: formData.state,
      city: formData.city,
      postalCode: formData.postalCode
    };

    // Calculate tax
    const breakdown = taxService.getTaxBreakdown(cartItems, taxAddress);
    setTaxBreakdown(breakdown);
  }, [formData.country, formData.state, formData.city, formData.postalCode, cartItems]);

  // Handle shipping option change
  const handleShippingOptionChange = async (optionId: string) => {
    setSelectedShippingOption(optionId);

    // Create shipping address from form data
    const shippingAddress: ShippingAddress = {
      country: formData.country,
      state: formData.state,
      city: formData.city,
      postalCode: formData.postalCode,
      address: formData.address,
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      email: formData.email
    };

    try {
      // Calculate shipping cost asynchronously
      const cost = await shippingService.calculateShippingCost(cartItems, optionId, shippingAddress);
      setShippingCost(cost);
    } catch (error) {
      console.error('Error calculating shipping cost:', error);
      // Fallback to standard calculation
      const option = shippingOptions.find(opt => opt.id === optionId);
      setShippingCost(option?.price || 0);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Handle checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;

      if (name === 'useAddressAutofill') {
        setUseAddressAutofill(checked);
        return;
      }

      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // If country or state changes, update shipping options and cost
    if (name === 'country' || name === 'state') {
      const updatedFormData = { ...formData, [name]: value };

      // Create shipping address from updated form data
      const shippingAddress: ShippingAddress = {
        country: updatedFormData.country,
        state: updatedFormData.state,
        city: updatedFormData.city,
        postalCode: updatedFormData.postalCode
      };

      // Get updated shipping options
      const options = shippingService.getShippingOptions(shippingAddress);
      setShippingOptions(options);

      // Recalculate shipping cost
      const cost = shippingService.calculateShippingCost(cartItems, selectedShippingOption, shippingAddress);
      setShippingCost(cost);
    }
  };

  // Handle address autofill selection
  const handleAddressSelected = (addressData: AddressData) => {
    setFormData(prevState => ({
      ...prevState,
      address: addressData.address,
      apartment: addressData.apartment || '',
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
      country: addressData.country
    }));

    // Create shipping address from selected address
    const shippingAddress: ShippingAddress = {
      country: addressData.country,
      state: addressData.state,
      city: addressData.city,
      postalCode: addressData.postalCode
    };

    // Get updated shipping options
    const options = shippingService.getShippingOptions(shippingAddress);
    setShippingOptions(options);

    // Recalculate shipping cost
    const cost = shippingService.calculateShippingCost(cartItems, selectedShippingOption, shippingAddress);
    setShippingCost(cost);
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId);
    setPaymentMethod('saved_card');
    setUseNewPaymentMethod(false);
  };

  // Handle digital wallet payment
  const handleDigitalWalletPayment = (paymentMethod: any) => {
    setDigitalWalletPaymentMethod(paymentMethod);
    setPaymentMethod('digital_wallet');
    toast.success('Digital wallet payment method selected');
  };

  // Handle digital wallet payment error
  const handleDigitalWalletError = (error: any) => {
    console.error('Digital wallet error:', error);
    toast.error('Failed to process digital wallet payment');
  };

  // Handle one-click checkout
  const handleOneClickCheckout = () => {
    // Mark checkout as started for tracking
    cartTrackingService.markCheckoutStarted(formData.email);
  };

  // Handle saved address selection
  const handleAddressSelect = (address: ShippingAddress) => {
    setFormData(prevState => ({
      ...prevState,
      firstName: address.name?.split(' ')[0] || prevState.firstName,
      lastName: address.name?.split(' ').slice(1).join(' ') || prevState.lastName,
      address: address.address || prevState.address,
      apartment: address.address2 || prevState.apartment || '',
      city: address.city || prevState.city,
      state: address.state || prevState.state,
      postalCode: address.postalCode || prevState.postalCode,
      country: address.country || prevState.country,
      phone: address.phone || prevState.phone
    }));

    setUseNewAddress(false);

    // Update shipping options based on the selected address
    updateShippingOptions(address);
  };

  // Handle adding a new address
  const handleAddNewAddress = () => {
    setUseNewAddress(true);
  };

  // Handle address validation
  const handleAddressValidation = (validatedAddress: ShippingAddress) => {
    setFormData(prevState => ({
      ...prevState,
      address: validatedAddress.address || prevState.address,
      apartment: validatedAddress.address2 || prevState.apartment || '',
      city: validatedAddress.city || prevState.city,
      state: validatedAddress.state || prevState.state,
      postalCode: validatedAddress.postalCode || prevState.postalCode,
      country: validatedAddress.country || prevState.country
    }));

    setAddressValidated(true);

    // Update shipping options based on the validated address
    updateShippingOptions(validatedAddress);

    toast.success('Address validated successfully');
  };

  // Handle coupon application
  const handleApplyCoupon = (coupon: Coupon, discountAmount: number) => {
    setAppliedCoupon(coupon);
    setDiscount(discountAmount);
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  // Update shipping options based on address
  const updateShippingOptions = async (address: ShippingAddress) => {
    try {
      // Get shipping options asynchronously
      const options = await shippingService.getShippingOptions(address, cartItems);
      setShippingOptions(options);

      // Recalculate shipping cost
      const cost = await shippingService.calculateShippingCost(
        cartItems,
        selectedShippingOption,
        address
      );
      setShippingCost(cost);

      // Check for free shipping eligibility
      const isEligible = await shippingService.isEligibleForFreeShipping(
        subtotal,
        cartItems,
        address
      );

      if (isEligible && selectedShippingOption === 'standard') {
        setShippingCost(0);
      }
    } catch (error) {
      console.error('Error updating shipping options:', error);
      // Fallback to standard options
      const options = shippingService.getFallbackShippingOptions({ country: address.country });
      setShippingOptions(options);
    }
  };

  // Create order in the database
  const createOrder = async (orderData: any) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const guestToken = guestUser?.guest_token;

      if (!user && !guestToken) {
        toast.error('Please sign in or continue as guest to complete your purchase');
        setShowGuestCheckout(true);
        return null;
      }

      // Create order in the database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          guest_token: !user ? guestToken : null,
          status: 'pending',
          subtotal: orderData.totals.subtotal,
          tax: orderData.totals.tax,
          shipping: orderData.totals.shipping,
          discount: orderData.totals.discount,
          total: orderData.totals.total,
          shipping_address: {
            first_name: orderData.customer.firstName,
            last_name: orderData.customer.lastName,
            address: orderData.shipping.address.address,
            apartment: orderData.shipping.address.address2,
            city: orderData.shipping.address.city,
            state: orderData.shipping.address.state,
            postal_code: orderData.shipping.address.postalCode,
            country: orderData.shipping.address.country,
            phone: orderData.shipping.address.phone,
            email: orderData.customer.email
          },
          billing_address: orderData.billing.sameAsShipping ? null : {
            first_name: orderData.billing.address.name?.split(' ')[0] || '',
            last_name: orderData.billing.address.name?.split(' ').slice(1).join(' ') || '',
            address: orderData.billing.address.address,
            apartment: orderData.billing.address.address2,
            city: orderData.billing.address.city,
            state: orderData.billing.address.state,
            postal_code: orderData.billing.address.postalCode,
            country: orderData.billing.address.country,
            phone: orderData.billing.address.phone
          },
          shipping_method: orderData.shipping.method.id,
          courier_id: orderData.shipping.method.courier_id,
          courier_name: orderData.shipping.method.courier_name,
          tax_rate: taxBreakdown.taxRate,
          tax_description: taxBreakdown.taxDescription,
          payment_method: orderData.payment.method,
          coupon_id: orderData.coupon?.id || null,
          discount_amount: orderData.coupon ? orderData.totals.discount : 0,
          notes: orderData.notes || null
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      if (!order) throw new Error('Failed to create order');

      // Create order items
      const orderItems = orderData.items.map((item: CartItem) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || 0,
        name: item.product?.name || item.product?.title || 'Product',
        image_url: item.product?.image_url || item.product?.image || '/assets/img/placeholder.jpg'
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) throw orderItemsError;

      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  };

  // Save shipping address to user profile
  const saveShippingAddress = async (address: ShippingAddress) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Check if this is the first address (should be default)
      const { data: existingAddresses } = await supabase
        .from('shipping_addresses')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const isDefault = !existingAddresses || existingAddresses.length === 0;

      // Save address
      await supabase
        .from('shipping_addresses')
        .insert({
          user_id: user.id,
          first_name: address.name?.split(' ')[0] || '',
          last_name: address.name?.split(' ').slice(1).join(' ') || '',
          address: address.address || '',
          apartment: address.address2 || '',
          city: address.city || '',
          state: address.state || '',
          postal_code: address.postalCode || '',
          country: address.country || '',
          phone: address.phone || '',
          is_default: isDefault
        });
    } catch (error) {
      console.error('Error saving shipping address:', error);
    }
  };

  // Handle guest checkout form submission
  const handleGuestCheckout = (guestData: GuestUser) => {
    setGuestUser(guestData);
    setShowGuestCheckout(false);

    // Populate form with guest data
    setFormData(prevState => ({
      ...prevState,
      email: guestData.email || '',
      firstName: guestData.first_name || '',
      lastName: guestData.last_name || '',
      address: guestData.address || '',
      apartment: guestData.apartment || '',
      city: guestData.city || '',
      state: guestData.state || '',
      postalCode: guestData.postal_code || '',
      country: guestData.country || 'US',
      phone: guestData.phone || ''
    }));

    toast.success('Guest information saved');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!isCartValid) {
      toast.error('Please resolve the cart issues before proceeding');
      return;
    }

    // Validate shipping address
    if (!addressValidated && formData.address && formData.city && formData.state && formData.postalCode) {
      toast.warning('Please validate your shipping address before proceeding');
      return;
    }

    // Mark checkout as started for abandoned cart tracking
    await cartTrackingService.markCheckoutStarted(formData.email);

    try {
      setProcessingPayment(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const guestToken = guestUser?.guest_token;

      if (!user && !guestToken) {
        toast.error('Please sign in or continue as guest to complete your purchase');
        setShowGuestCheckout(true);
        setProcessingPayment(false);
        return;
      }

      // Save user profile information if authenticated and requested
      if (user && formData.saveInfo) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error saving profile:', profileError);
        }
      }

      // Create shipping address from form data
      const shippingAddress: ShippingAddress = {
        country: formData.country,
        state: formData.state,
        city: formData.city,
        postalCode: formData.postalCode,
        address: formData.address,
        address2: formData.apartment,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email
      };

      // Get shipping option details
      const selectedOption = shippingOptions.find(option => option.id === selectedShippingOption);
      if (!selectedOption) {
        toast.error('Please select a shipping option');
        setProcessingPayment(false);
        return;
      }

      // Calculate final shipping cost
      const finalShippingCost = await shippingService.calculateShippingCost(
        cartItems,
        selectedShippingOption,
        shippingAddress
      );

      // Create billing address (same as shipping or separate)
      const billingAddress = formData.sameAsShipping ? shippingAddress : {
        country: formData.billingCountry,
        state: formData.billingState,
        city: formData.billingCity,
        postalCode: formData.billingPostalCode,
        address: formData.billingAddress,
        address2: formData.billingApartment,
        name: `${formData.billingFirstName} ${formData.billingLastName}`,
        phone: formData.billingPhone,
        email: formData.email
      };

      // Create order data
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        shipping: {
          address: shippingAddress,
          method: {
            id: selectedOption.id,
            name: selectedOption.name,
            price: finalShippingCost,
            courier_id: selectedOption.courier_id,
            courier_name: selectedOption.courier_name,
            service_type: selectedOption.service_type
          }
        },
        billing: {
          sameAsShipping: formData.sameAsShipping,
          address: billingAddress
        },
        payment: {
          method: paymentMethod,
          paymentMethodId: selectedPaymentMethodId
        },
        items: cartItems,
        totals: {
          subtotal,
          tax: taxBreakdown.taxAmount,
          shipping: finalShippingCost,
          discount,
          total: subtotal + taxBreakdown.taxAmount + finalShippingCost - discount
        },
        coupon: appliedCoupon ? {
          id: appliedCoupon.id,
          code: appliedCoupon.code,
          discount_type: appliedCoupon.discount_type,
          discount_value: appliedCoupon.discount_value,
          discount_amount: discount
        } : null,
        notes: formData.notes
      };

      // Create order
      const orderId = await createOrder(orderData);

      if (!orderId) {
        throw new Error('Failed to create order');
      }

      // Apply coupon if used
      if (appliedCoupon) {
        await couponService.applyCoupon(appliedCoupon.id, orderId);
      }

      // Save shipping address if requested
      if (isAuthenticated && formData.saveInfo && useNewAddress) {
        await saveShippingAddress(shippingAddress);
      }

      // Prepare checkout data for payment processing
      const checkoutData: any = {
        orderId,
        items: cartItems.map(item => ({
          id: item.product_id,
          name: item.product?.name || 'Product',
          price: item.product?.price || 0,
          quantity: item.quantity,
          image: item.product?.image_url || item.product?.image || '/assets/img/placeholder.jpg'
        })),
        shipping: {
          cost: finalShippingCost,
          method: selectedOption.name,
          address: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            apartment: formData.apartment,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone
          }
        },
        tax: {
          amount: taxBreakdown.taxAmount,
          rate: taxBreakdown.taxRate,
          description: taxBreakdown.taxDescription
        },
        discount,
        customer: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone
        },
        guestToken: guestToken
      };

      // Add payment method details if using saved card or digital wallet
      if (paymentMethod === 'saved_card' && selectedPaymentMethodId) {
        checkoutData.paymentMethod = 'saved_card';
        checkoutData.paymentMethodId = selectedPaymentMethodId;
      } else if (paymentMethod === 'digital_wallet' && digitalWalletPaymentMethod) {
        checkoutData.paymentMethod = 'digital_wallet';
        checkoutData.digitalWalletPaymentMethod = digitalWalletPaymentMethod;
      }

      // Create Stripe checkout session (API route call)
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Clear cart after successful checkout
      await cartService.clearCart();

      // Mark checkout as completed for tracking
      await cartTrackingService.markCheckoutCompleted();

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Failed to create checkout session');
      }

    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Failed to process checkout');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Checkout</h1>
        <div className="tw-animate-pulse">
          <div className="tw-h-10 tw-bg-gray-200 tw-rounded tw-mb-6 tw-w-1/2"></div>
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
            <div>
              <div className="tw-h-6 tw-bg-gray-200 tw-rounded tw-mb-4 tw-w-1/3"></div>
              <div className="tw-h-10 tw-bg-gray-200 tw-rounded tw-mb-6 tw-w-full"></div>
              <div className="tw-h-6 tw-bg-gray-200 tw-rounded tw-mb-4 tw-w-1/3"></div>
              <div className="tw-h-10 tw-bg-gray-200 tw-rounded tw-mb-6 tw-w-full"></div>
            </div>
            <div>
              <div className="tw-h-6 tw-bg-gray-200 tw-rounded tw-mb-4 tw-w-1/3"></div>
              <div className="tw-h-40 tw-bg-gray-200 tw-rounded tw-mb-6 tw-w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-12 tw-text-center">
        <h1 className="tw-text-2xl tw-font-bold tw-mb-4">Your cart is empty</h1>
        <p className="tw-mb-8 tw-text-gray-600">Add some items to your cart before checking out</p>
        <Link href="/shop" className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-6 tw-py-3 tw-rounded-md tw-font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  // Show guest checkout form
  if (showGuestCheckout) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8 tw-max-w-3xl">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Checkout</h1>
        <GuestCheckoutForm
          onSubmit={handleGuestCheckout}
          onCancel={() => {
            setShowGuestCheckout(false);
            router.push('/login?redirect=/checkout');
          }}
        />
      </div>
    );
  }

  // Show authentication options if not authenticated and no guest user
  if (isAuthenticated === false && !guestUser) {
    return (
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-12 tw-max-w-3xl">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Checkout</h1>
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Sign In or Continue as Guest</h2>
          <p className="tw-text-gray-600 tw-mb-6">
            Sign in to your account for a faster checkout experience, or continue as a guest.
          </p>
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4">
            <Link
              href="/login?redirect=/checkout"
              className="tw-flex-1 tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-py-3 tw-px-6 tw-rounded-md tw-font-medium tw-text-center"
            >
              Sign In
            </Link>
            <button
              onClick={() => setShowGuestCheckout(true)}
              className="tw-flex-1 tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-800 tw-py-3 tw-px-6 tw-rounded-md tw-font-medium"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-8 tw-max-w-7xl">
      <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Checkout</h1>

      <CartValidation onValidationComplete={setIsCartValid}>
        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8">
          {/* Checkout Form */}
          <div className="lg:tw-col-span-7">
            {/* One-Click Checkout for returning users */}
            {isAuthenticated && ENABLE_ENHANCED_CHECKOUT && (
              <OneClickCheckout
                onCheckout={handleOneClickCheckout}
                disabled={!isCartValid || processingPayment}
              />
            )}

            {/* Digital Wallet Payment */}
            {ENABLE_DIGITAL_WALLET && (
              <div className="tw-mb-6">
                <DigitalWalletButton
                  amount={total}
                  onPaymentSuccess={handleDigitalWalletPayment}
                  onPaymentError={handleDigitalWalletError}
                  customerEmail={formData.email}
                  customerName={`${formData.firstName} ${formData.lastName}`}
                  disabled={!isCartValid || processingPayment}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-overflow-hidden">
              {/* Contact Information */}
              <div className="tw-p-6 tw-border-b tw-border-gray-200">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Contact Information</h2>
                <div className="tw-mb-4">
                  <label htmlFor="email" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Shipping Information */}
              <div className="tw-p-6 tw-border-b tw-border-gray-200">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Shipping Address</h2>

                {/* Saved Addresses for authenticated users */}
                {isAuthenticated && showSavedAddresses && ENABLE_SAVED_ADDRESSES && (
                  <div className="tw-mb-6">
                    <SavedAddresses
                      onSelectAddress={handleAddressSelect}
                      onAddNewAddress={handleAddNewAddress}
                    />
                  </div>
                )}

                {/* New Address Form */}
                {(useNewAddress || !isAuthenticated) && (
                  <>
                    {/* Address Autofill Toggle */}
                    <div className="tw-mb-4 tw-flex tw-items-center">
                      <input
                        type="checkbox"
                        id="useAddressAutofill"
                        name="useAddressAutofill"
                        checked={useAddressAutofill}
                        onChange={handleInputChange}
                        className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300 tw-rounded"
                      />
                      <label htmlFor="useAddressAutofill" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-700">
                        Use address autocomplete
                      </label>
                    </div>

                    {useAddressAutofill ? (
                      <AddressAutofill
                        onAddressSelected={handleAddressSelected}
                        defaultValue={formData.address}
                        required
                      />
                    ) : (
                      <>
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                          <div className="tw-mb-4">
                            <label htmlFor="firstName" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                              required
                              autoComplete="given-name"
                            />
                          </div>
                          <div className="tw-mb-4">
                            <label htmlFor="lastName" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                              required
                              autoComplete="family-name"
                            />
                          </div>
                        </div>

                        <div className="tw-mb-4">
                          <label htmlFor="address" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                            Address
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                            required
                            autoComplete="street-address"
                          />
                        </div>

                        <div className="tw-mb-4">
                          <label htmlFor="apartment" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                            Apartment, suite, etc. (optional)
                          </label>
                          <input
                            type="text"
                            id="apartment"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleInputChange}
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                            autoComplete="address-line2"
                          />
                        </div>

                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-4">
                          <div className="tw-mb-4">
                            <label htmlFor="city" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                              required
                              autoComplete="address-level2"
                            />
                          </div>
                          <div className="tw-mb-4">
                            <label htmlFor="state" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                              State/Province
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                              required
                              autoComplete="address-level1"
                            />
                          </div>
                          <div className="tw-mb-4">
                            <label htmlFor="postalCode" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              id="postalCode"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                              required
                              autoComplete="postal-code"
                            />
                          </div>
                        </div>

                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                          <div className="tw-mb-4">
                            <label htmlFor="country" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                              Country
                            </label>
                            <select
                              id="country"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                              required
                              autoComplete="country"
                            >
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="GB">United Kingdom</option>
                              <option value="AU">Australia</option>
                              <option value="DE">Germany</option>
                              <option value="FR">France</option>
                              <option value="JP">Japan</option>
                            </select>
                          </div>
                          <div className="tw-mb-4">
                            <label htmlFor="phone" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
                              required
                              autoComplete="tel"
                            />
                          </div>
                        </div>

                        {/* Address Validation */}
                        {ENABLE_ADDRESS_VALIDATION && !addressValidated && formData.address && formData.city && formData.state && formData.postalCode && (
                          <AddressValidator
                            address={{
                              country: formData.country,
                              state: formData.state,
                              city: formData.city,
                              postalCode: formData.postalCode,
                              address: formData.address,
                              address2: formData.apartment,
                              name: `${formData.firstName} ${formData.lastName}`,
                              phone: formData.phone,
                              email: formData.email
                            }}
                            onValidAddress={handleAddressValidation}
                          />
                        )}
                      </>
                    )}

                    {isAuthenticated && (
                      <div className="tw-flex tw-items-center tw-mt-4">
                        <input
                          type="checkbox"
                          id="saveInfo"
                          name="saveInfo"
                          checked={formData.saveInfo}
                          onChange={handleInputChange}
                          className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300 tw-rounded"
                        />
                        <label htmlFor="saveInfo" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-700">
                          Save this address for future orders
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Payment Method */}
              <div className="tw-p-6 tw-border-b tw-border-gray-200">
                <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Payment Method</h2>

                {/* Saved Payment Methods */}
                {isAuthenticated && showSavedPaymentMethods && ENABLE_SAVED_PAYMENT_METHODS && (
                  <div className="tw-mb-6">
                    <SavedPaymentMethods
                      onSelect={handlePaymentMethodSelect}
                      onAddNew={() => setUseNewPaymentMethod(true)}
                    />
                  </div>
                )}

                {/* New Payment Method */}
                {(useNewPaymentMethod || !isAuthenticated) && (
                  <div className="tw-space-y-4">
                    <div className="tw-flex tw-items-center">
                      <input
                        type="radio"
                        id="card"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300"
                      />
                      <label htmlFor="card" className="tw-ml-2 tw-flex tw-items-center">
                        <span className="tw-mr-2">Credit Card</span>
                        <span className="tw-flex tw-space-x-1">
                          <span className="tw-bg-gray-100 tw-px-2 tw-py-1 tw-rounded tw-text-xs">Visa</span>
                          <span className="tw-bg-gray-100 tw-px-2 tw-py-1 tw-rounded tw-text-xs">Mastercard</span>
                          <span className="tw-bg-gray-100 tw-px-2 tw-py-1 tw-rounded tw-text-xs">Amex</span>
                        </span>
                      </label>
                    </div>

                    <div className="tw-flex tw-items-center">
                      <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={() => setPaymentMethod("paypal")}
                        className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300"
                      />
                      <label htmlFor="paypal" className="tw-ml-2">
                        PayPal
                      </label>
                    </div>
                  </div>
                )}

                <p className="tw-text-sm tw-text-gray-500 tw-mt-4">
                  All transactions are secure and encrypted. Your payment details will not be stored on our servers.
                </p>
              </div>

              {/* Submit Button */}
              <div className="tw-p-6">
                <button
                  type="submit"
                  disabled={processingPayment || !isCartValid}
                  className="tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-py-3 tw-px-6 tw-rounded-md tw-font-medium tw-transition-colors disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                >
                  {processingPayment ? 'Processing...' : 'Complete Order'}
                </button>
                <p className="tw-text-sm tw-text-center tw-text-gray-500 tw-mt-4">
                  By completing your purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </form>
          </div>

        {/* Order Summary */}
        <div className="lg:tw-col-span-5">
          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            tax={taxBreakdown.taxAmount}
            shipping={shippingCost}
            discount={discount}
            appliedCoupon={appliedCoupon}
            showDetails={true}
            className="tw-sticky tw-top-8"
          />

          {/* Shipping Options */}
          <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-overflow-hidden tw-mt-6">
            <div className="tw-p-6">
              <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Shipping Options</h2>

              {/* Create shipping address from form data */}
              <ShippingOptions
                address={{
                  country: formData.country,
                  state: formData.state,
                  city: formData.city,
                  postalCode: formData.postalCode,
                  address: formData.address,
                  address2: formData.apartment,
                  name: `${formData.firstName} ${formData.lastName}`,
                  phone: formData.phone,
                  email: formData.email
                }}
                cartItems={cartItems}
                selectedOption={selectedShippingOption}
                onSelectOption={handleShippingOptionChange}
              />
            </div>
          </div>

          {/* Coupon Code */}
          {ENABLE_COUPONS && (
            <div className="tw-bg-white tw-rounded-lg tw-shadow-sm tw-overflow-hidden tw-mt-6">
              <div className="tw-p-6">
                <CouponForm
                  subtotal={subtotal}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                  appliedCoupon={appliedCoupon}
                  shippingAddress={{
                    country: formData.country,
                    state: formData.state,
                    city: formData.city,
                    postalCode: formData.postalCode,
                    address: formData.address,
                    address2: formData.apartment
                  }}
                  showFreeShippingWarning={true}
                />
              </div>
            </div>
          )}
        </div>
        </div>
      </CartValidation>
    </div>
  );
};

export default CheckoutPage;
