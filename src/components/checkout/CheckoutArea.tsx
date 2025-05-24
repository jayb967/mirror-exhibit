
'use client'

import UseCartInfo from '@/hooks/UseCartInfo';
import NiceSelect from '@/ui/NiceSelect';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useClerkAuth';
import { useClerk } from '@clerk/nextjs';
import { shippingService, ShippingOption } from '@/services/shippingService';
import { cartService } from '@/services/cartService';
import { cartTrackingService } from '@/services/cartTrackingService';
import { couponService, Coupon } from '@/services/couponService';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const CheckoutArea = () => {
  const router = useRouter();
  const selectHandler = (e: any) => { };

  // Authentication and cart hooks
  const { isAuthenticated, user, isLoading } = useAuth();
  const { openSignIn } = useClerk();

  // Redux cart data
  const cartItems = useSelector((state: any) => state.cart.cart);
  const cartLoading = useSelector((state: any) => state.cart.isLoading);

  // Calculate cart totals
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    return sum + ((item.price || item.product?.price || 0) * item.quantity);
  }, 0);

  const cartTotal = subtotal;

  // UI state
  const [activeLogin, setActiveLopin] = useState(false)
  const handleActiveLogin = () => {
    // Use Clerk modal instead of dropdown
    openSignIn({ redirectUrl: '/checkout' });
  }

  const [activeCoupon, setActiveCoupon] = useState(false)
  const handleActiveCoupon = () => {
    setActiveCoupon(!activeCoupon)
  }

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Form validation state
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Payment method state
  const [bankOpen, setBankOpen] = useState<boolean>(false)
  const [chequeOpen, setChequeOpen] = useState<boolean>(false)
  const [cashOpen, setCashOpen] = useState<boolean>(false)

  // Shipping state
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('standard');
  const [shippingCost, setShippingCost] = useState<number>(0);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    country: 'United States (US)',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    email: '',
    createAccount: false,
    shipToDifferent: false,
    orderNotes: ''
  });

  // Processing state
  const [processing, setProcessing] = useState(false);

  // Anonymous user and auto-save state
  const [anonymousUser, setAnonymousUser] = useState<any>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Redux compatibility (for existing components that might depend on it)
  const productItem = useSelector((state: any) => state.cart.cart);
  const dispatch = useDispatch();
  const { total } = UseCartInfo();

  // Tax state
  const [taxRate, setTaxRate] = useState(0);
  const [taxEnabled, setTaxEnabled] = useState(true);

  // Calculate totals
  const tax = taxEnabled ? subtotal * taxRate : 0;
  const finalTotal = subtotal + shippingCost + tax - couponDiscount;

  // Form validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value.trim()) return `${fieldName} is required`;
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Required field validation
    const firstNameError = validateRequired(formData.firstName, 'First name');
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateRequired(formData.lastName, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;

    const addressError = validateRequired(formData.address, 'Address');
    if (addressError) errors.address = addressError;

    const cityError = validateRequired(formData.city, 'City');
    if (cityError) errors.city = cityError;

    const stateError = validateRequired(formData.state, 'State');
    if (stateError) errors.state = stateError;

    const postalCodeError = validateRequired(formData.postalCode, 'Postal code');
    if (postalCodeError) errors.postalCode = postalCodeError;

    // Phone validation
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;

    // Shipping option validation
    if (!selectedShippingOption || shippingOptions.length === 0) {
      errors.shipping = 'Please select a shipping option';
    }

    // Terms validation
    if (!termsAccepted) {
      errors.terms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);

    // Scroll to first error if any
    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      let element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;

      // Special cases for non-form fields
      if (firstErrorField === 'shipping') {
        element = document.querySelector('.tp-order-info-list-shipping') as HTMLElement;
      } else if (firstErrorField === 'terms') {
        element = document.querySelector('#read_all') as HTMLElement;
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (element.focus) element.focus();
      }

      // Show error message
      const errorMessages = Object.values(errors);
      toast.error(`Please fix the following: ${errorMessages[0]}`);
      return false;
    }

    return true;
  };

  // Load tax settings from database
  useEffect(() => {
    const loadTaxSettings = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: settings, error } = await supabase
          .from('site_settings')
          .select('tax_rate, tax_enabled')
          .single();

        if (error) {
          console.error('Error loading tax settings:', error);
          // Use default values if settings can't be loaded
          setTaxRate(0.0875); // Default 8.75%
          setTaxEnabled(true);
        } else if (settings) {
          setTaxRate(settings.tax_rate || 0);
          setTaxEnabled(settings.tax_enabled !== false);
        }
      } catch (error) {
        console.error('Error loading tax settings:', error);
        // Use default values
        setTaxRate(0.0875);
        setTaxEnabled(true);
      }
    };

    loadTaxSettings();
  }, []);

  // Initialize anonymous user on mount (Clerk version)
  useEffect(() => {
    const initializeAnonymousUser = async () => {
      if (!isAuthenticated && cartItems.length > 0) {
        try {
          // For Clerk, create a pseudo-anonymous user using guest token
          const guestToken = cartService.getGuestToken();
          const anonymousUserId = `guest_${guestToken}`;

          // Set anonymous user state
          setAnonymousUser({ id: anonymousUserId, is_anonymous: true });

          // Create Supabase client for guest operations
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          // Guest user data is now handled by cart_tracking table
          console.log('Anonymous user initialized, cart tracking will handle guest data');

          // Track cart activity
          await cartTrackingService.trackCartActivity(cartItems, formData.email, true, false);
        } catch (error) {
          console.error('Error initializing anonymous user:', error);
        }
      }
    };

    initializeAnonymousUser();
  }, [isAuthenticated, cartItems.length]);

  // Auto-save guest user data on form field blur
  const handleAutoSave = async (fieldName: string, value: string) => {
    if (!isAuthenticated && anonymousUser) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save
      const timeout = setTimeout(async () => {
        try {
          const guestData: any = {};

          // Map form fields to guest user fields
          switch (fieldName) {
            case 'firstName':
              guestData.first_name = value;
              break;
            case 'lastName':
              guestData.last_name = value;
              break;
            case 'email':
              guestData.email = value;
              break;
            case 'phone':
              guestData.phone = value;
              break;
            case 'address':
              guestData.address = value;
              break;
            case 'city':
              guestData.city = value;
              break;
            case 'state':
              guestData.state = value;
              break;
            case 'postalCode':
              guestData.postal_code = value;
              break;
            case 'country':
              guestData.country = value;
              break;
          }

          // Save guest user data
          await cartTrackingService.trackGuestUserData(guestData);

          // Update cart tracking
          await cartTrackingService.trackCartActivity(cartItems, formData.email, true, false);
        } catch (error) {
          console.error('Error auto-saving guest data:', error);
        }
      }, 1000); // Auto-save after 1 second of inactivity

      setAutoSaveTimeout(timeout);
    }
  };

  // Load shipping options on mount and when address changes
  useEffect(() => {
    const loadShippingOptions = async () => {
      if (formData.address && formData.city && formData.state && formData.postalCode) {
        const address = {
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        };

        try {
          console.log('Loading shipping options for address:', address);

          // Call the API route instead of the service directly
          const response = await fetch('/api/shipping/rates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address,
              cartItems
            })
          });

          if (!response.ok) {
            throw new Error('Failed to fetch shipping rates');
          }

          const data = await response.json();
          console.log('Received shipping options:', data.options);
          setShippingOptions(data.options);

          // Calculate shipping cost for selected option
          if (data.options.length > 0) {
            const selectedOption = data.options.find(option => option.id === selectedShippingOption) || data.options[0];
            setShippingCost(selectedOption.price);
            if (!selectedShippingOption) {
              setSelectedShippingOption(selectedOption.id);
            }
          }
        } catch (error) {
          console.error('Error loading shipping options:', error);
        }
      }
    };

    loadShippingOptions();
  }, [formData.address, formData.city, formData.state, formData.postalCode, formData.country, selectedShippingOption, cartItems]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form input blur for auto-save
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleAutoSave(name, value);
  };

  // Handle shipping option change
  const handleShippingChange = async (optionId: string, price: number) => {
    setSelectedShippingOption(optionId);
    setShippingCost(price);
  };

  // Handle coupon submission
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim() || appliedCoupon) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
          shippingAddress: {
            country: formData.country,
            state: formData.state,
            city: formData.city,
            postalCode: formData.postalCode,
            address: formData.address,
            address2: formData.apartment
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid coupon code');
      }

      // Coupon is valid
      setAppliedCoupon(data.coupon);
      setCouponDiscount(data.discount);
      setCouponCode('');
      toast.success(`Coupon applied: ${data.coupon.discount_type === 'percentage'
        ? `${data.coupon.discount_value}% off`
        : `$${data.coupon.discount_value.toFixed(2)} off`}`);
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError((error as Error).message);
    } finally {
      setCouponLoading(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError(null);
    toast.success('Coupon removed');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate form data
    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      // Create order data
      const orderData = {
        items: cartItems.map(item => ({
          id: item.product_id || item.id,
          name: item.title || item.product?.name || 'Product',
          price: item.price || item.product?.price || 0,
          quantity: item.quantity,
          image: item.image || item.product?.image_url
        })),
        customer: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone
        },
        shipping: {
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          cost: shippingCost,
          option: selectedShippingOption
        },
        billing: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email
        },
        subtotal,
        tax,
        shipping: shippingCost,
        total: finalTotal,
        notes: formData.orderNotes,
        createAccount: formData.createAccount
      };

      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { orderId } = await response.json();

      // Create Stripe checkout session
      const checkoutResponse = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          items: orderData.items,
          shipping: shippingCost,
          tax,
          customer: orderData.customer,
          guestToken: !isAuthenticated ? cartService.getGuestToken() : undefined
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await checkoutResponse.json();

      // Track checkout completion
      await cartTrackingService.updateCheckoutStatus(true, false, formData.email);

      // Clear cart and redirect to Stripe
      await cartService.clearCart();

      if (url) {
        window.location.href = url;
      } else {
        toast.error('Failed to create checkout session');
      }

    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Redirect if cart is empty
  if (cartItems.length === 0 && !cartLoading) {
    return (
      <section className="tp-checkout-area pb-160 pt-160">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h3>Your cart is empty</h3>
              <p className="mb-4">Add some items to your cart before checking out</p>
              <Link href="/shop" className="tp-btn-theme">
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="tp-checkout-area pb-160 pt-160">
        <div className="container">
          <div className="row">
            <div className="col-xl-7 col-lg-7">
              <div className="tp-checkout-verify">
                <div className="tp-checkout-verify-item">
                  <p className="tp-checkout-verify-reveal">
                    Returning customer? {' '}
                    <button type="button"
                      onClick={handleActiveLogin}
                      className="tp-checkout-login-form-reveal-btn"> Click here to login</button>
                  </p>

                  <div id="tpReturnCustomerLoginForm" className="tp-return-customer" style={{ display: `${activeLogin ? 'block' : 'none'}` }}>
                    <form onSubmit={e => e.preventDefault()}>

                      <div className="tp-return-customer-input">
                        <label>Email</label>
                        <input type="text" placeholder="Your Email" />
                      </div>
                      <div className="tp-return-customer-input">
                        <label>Password</label>
                        <input type="password" placeholder="Password" />
                      </div>

                      <div className="tp-return-customer-suggetions d-sm-flex align-items-center justify-content-between mb-20">
                        <div className="tp-return-customer-remeber">
                          <input id="remeber" type="checkbox" />
                          <label htmlFor="remeber">Remember me</label>
                        </div>
                        <div className="tp-return-customer-forgot">
                          <a href="#">Forgot Password?</a>
                        </div>
                      </div>
                      <button type="submit" className="tp-btn-theme"><span>Login</span></button>
                    </form>
                  </div>
                </div>
                <div className="tp-checkout-verify-item">
                  <p className="tp-checkout-verify-reveal">
                    Have a coupon?{' '}
                    <button type="button"
                      onClick={handleActiveCoupon}
                      className="tp-checkout-coupon-form-reveal-btn">
                      Click here to enter your code
                    </button>
                  </p>

                  <div id="tpCheckoutCouponForm" className="tp-return-customer" style={{ display: `${activeCoupon ? 'block' : 'none'}` }}>
                    <form onSubmit={handleCouponSubmit}>
                      <div className="tp-return-customer-input">
                        <label>Coupon Code :</label>
                        <input
                          type="text"
                          placeholder="Coupon"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          disabled={couponLoading}
                        />
                      </div>
                      {couponError && (
                        <div style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>
                          {couponError}
                        </div>
                      )}
                      {appliedCoupon && appliedCoupon.discount_type && (
                        <div style={{ color: 'green', fontSize: '14px', marginBottom: '10px' }}>
                          Coupon applied: {appliedCoupon.discount_type === 'percentage'
                            ? `${appliedCoupon.discount_value}% off`
                            : `$${appliedCoupon.discount_value.toFixed(2)} off`}
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            style={{ marginLeft: '10px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <button
                        type="submit"
                        className="tp-btn-theme"
                        disabled={couponLoading || !couponCode.trim() || !!appliedCoupon}
                      >
                        <span>{couponLoading ? 'Applying...' : 'Apply'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="tp-checkout-bill-area">
                <h3 className="tp-checkout-bill-title">Billing Details</h3>
                <div className="tp-checkout-bill-form">
                  <form onSubmit={handleSubmit}>
                    <div className="tp-checkout-bill-inner">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="tp-checkout-input">
                            <label>First Name <span>*</span></label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              onBlur={handleInputBlur}
                              placeholder="First Name"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="tp-checkout-input">
                            <label>Last Name <span>*</span></label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              onBlur={handleInputBlur}
                              placeholder="Last Name"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Company name (optional)</label>
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleInputChange}
                              placeholder="Example LTD."
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Country / Region </label>
                            <input
                              type="text"
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              placeholder="United States (US)"
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Street address</label>
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="House number and street name"
                              required
                            />
                          </div>

                          <div className="tp-checkout-input">
                            <input
                              type="text"
                              name="apartment"
                              value={formData.apartment}
                              onChange={handleInputChange}
                              placeholder="Apartment, suite, unit, etc. (optional)"
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Town / City</label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="City"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="tp-checkout-input">
                            <label>State / County</label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              placeholder="State"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="tp-checkout-input">
                            <label>Postcode ZIP</label>
                            <input
                              type="text"
                              name="postalCode"
                              value={formData.postalCode}
                              onChange={handleInputChange}
                              placeholder="ZIP Code"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Phone <span>*</span></label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Phone Number"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Email address <span>*</span></label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              onBlur={handleInputBlur}
                              placeholder="Email Address"
                              required
                              style={{
                                borderColor: formErrors.email ? 'red' : undefined
                              }}
                            />
                            {formErrors.email && (
                              <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                {formErrors.email}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-option-wrapper">
                            {!isAuthenticated && (
                              <div className="tp-checkout-option">
                                <input
                                  id="create_free_account"
                                  type="checkbox"
                                  name="createAccount"
                                  checked={formData.createAccount}
                                  onChange={handleInputChange}
                                />
                                <label htmlFor="create_free_account">Create an account?</label>
                              </div>
                            )}
                            <div className="tp-checkout-option">
                              <input
                                id="ship_to_diff_address"
                                type="checkbox"
                                name="shipToDifferent"
                                checked={formData.shipToDifferent}
                                onChange={handleInputChange}
                              />
                              <label htmlFor="ship_to_diff_address">Ship to a different address?</label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Order notes (optional)</label>
                            <textarea
                              name="orderNotes"
                              value={formData.orderNotes}
                              onChange={handleInputChange}
                              placeholder="Notes about your order, e.g. special notes for delivery."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-lg-5">

              <div className="tp-checkout-place">
                <h3 className="tp-checkout-place-title pb-30">Your Order</h3>

                <div className="tp-order-info-list">
                  <ul>
                    <li className="tp-order-info-list-header">
                      <h4>Product</h4>
                      <h4>Total</h4>
                    </li>

                    {cartItems.map((item, index) => (
                      <li key={index} className="tp-order-info-list-desc">
                        <p>
                          {item.title || item.product?.name || 'Product'}
                          <span> ${item.price || item.product?.price || 0} x {item.quantity}</span>
                        </p>
                        <span>${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}

                    <li className="tp-order-info-list-subtotal">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </li>

                    <li className="tp-order-info-list-shipping">
                      <span>Shipping</span>
                      <div className="tp-order-info-list-shipping-item d-flex flex-column align-items-end">
                        {shippingOptions.length > 0 ? (
                          shippingOptions.map((option) => (
                            <span key={option.id}>
                              <input
                                id={`shipping_${option.id}`}
                                type="radio"
                                name="shipping"
                                checked={selectedShippingOption === option.id}
                                onChange={() => handleShippingChange(option.id, option.price)}
                              />
                              <label htmlFor={`shipping_${option.id}`}>
                                {option.name}:
                                <span>
                                  {option.isFreeShipping ? (
                                    <>
                                      <span style={{ textDecoration: 'line-through', color: '#999' }}>
                                        ${option.originalPrice?.toFixed(2)}
                                      </span>
                                      {' '}
                                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>FREE</span>
                                    </>
                                  ) : (
                                    `$${option.price.toFixed(2)}`
                                  )}
                                </span>
                                {option.estimatedDays && (
                                  <span style={{ fontSize: '0.9em', color: '#666', marginLeft: '8px' }}>
                                    ({option.estimatedDays} days)
                                  </span>
                                )}
                              </label>
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#666', fontStyle: 'italic' }}>
                            Please enter a complete shipping address to see available shipping options.
                          </span>
                        )}
                        {formErrors.shipping && (
                          <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {formErrors.shipping}
                          </div>
                        )}
                      </div>
                    </li>

                    <li className="tp-order-info-list-subtotal">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </li>

                    {appliedCoupon && couponDiscount > 0 && (
                      <li className="tp-order-info-list-subtotal">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span style={{ color: '#28a745' }}>-${couponDiscount.toFixed(2)}</span>
                      </li>
                    )}

                    <li className="tp-order-info-list-total">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </li>
                  </ul>
                </div>
                <div className="tp-checkout-payment">
                  <div className="tp-checkout-payment-item">
                    <input type="radio" id="stripe_payment" name="payment" defaultChecked />
                    <label htmlFor="stripe_payment">
                      Credit Card (Stripe)
                    </label>
                    <div className="tp-checkout-payment-desc">
                      <p>Pay securely with your credit card. Your payment information is processed securely by Stripe.</p>
                    </div>
                  </div>
                  {/* Other payment methods commented out - only Stripe for now */}
                  {/*
                  <div className="tp-checkout-payment-item">
                    <input type="radio" id="back_transfer" name="payment" />
                    <label htmlFor="back_transfer"
                      data-bs-toggle="direct-bank-transfer"
                      onClick={() => setBankOpen(!bankOpen)}>
                      Direct Bank Transfer
                    </label>
                    <div className="tp-checkout-payment-desc direct-bank-transfer" style={{ display: bankOpen ? 'block' : '' }}>
                      <p>Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.</p>
                    </div>
                  </div>
                  <div className="tp-checkout-payment-item">
                    <input type="radio" id="cheque_payment" name="payment" />
                    <label htmlFor="cheque_payment"
                      onClick={() => setChequeOpen(!chequeOpen)}>
                      Cheque Payment
                    </label>
                    <div className="tp-checkout-payment-desc cheque-payment" style={{ display: chequeOpen ? 'block' : '' }}>
                      <p>Please send a check to our store address. Your order will not be shipping until we receive and process your payment.</p>
                    </div>
                  </div>
                  <div className="tp-checkout-payment-item">
                    <input type="radio" id="cod" name="payment" />
                    <label htmlFor="cod" onClick={() => setCashOpen(!cashOpen)}>Cash on Delivery</label>
                    <div className="tp-checkout-payment-desc cash-on-delivery" style={{ display: cashOpen ? 'block' : '' }}>
                      <p>Pay with cash upon delivery. Available for local deliveries only.</p>
                    </div>
                  </div>
                  <div className="tp-checkout-payment-item paypal-payment">
                    <input type="radio" id="paypal" name="payment" />
                    <label htmlFor="paypal">PayPal <img src="assets/img/icon/payment-option.png" alt="" /> <a href="#">What is PayPal?</a></label>
                  </div>
                  */}
                </div>
                <div className="tp-checkout-agree">
                  <div className="tp-checkout-option">
                    <input
                      id="read_all"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                    />
                    <label htmlFor="read_all">I have read and agree to the website terms and conditions.</label>
                  </div>
                  {formErrors.terms && (
                    <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.terms}
                    </div>
                  )}
                </div>
                <div className="tp-checkout-btn-wrapper">
                  <button
                    type="submit"
                    className="tp-btn-theme text-center w-100"
                    disabled={processing || cartLoading || shippingOptions.length === 0 || !termsAccepted}
                    onClick={handleSubmit}
                  >
                    <span>
                      {processing ? 'Processing...' :
                       shippingOptions.length === 0 ? 'Enter shipping address to continue' :
                       !termsAccepted ? 'Please accept terms and conditions' :
                       'Place Order'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckoutArea;