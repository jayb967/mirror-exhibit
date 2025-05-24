
'use client'

import UseCartInfo from '@/hooks/UseCartInfo';
import NiceSelect from '@/ui/NiceSelect';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { shippingService, ShippingOption } from '@/services/shippingService';
import { cartService } from '@/services/cartService';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const CheckoutArea = () => {
  const router = useRouter();
  const selectHandler = (e: any) => { };

  // Authentication and cart hooks
  const { isAuthenticated, user, isLoading } = useAuth();
  const { cartItems, subtotal, total: cartTotal, loading: cartLoading } = useCart();

  // UI state
  const [activeLogin, setActiveLopin] = useState(false)
  const handleActiveLogin = () => {
    setActiveLopin(!activeLogin)
  }

  const [activeCoupon, setActiveCoupon] = useState(false)
  const handleActiveCoupon = () => {
    setActiveCoupon(!activeCoupon)
  }

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

  // Redux compatibility (for existing components that might depend on it)
  const productItem = useSelector((state: any) => state.cart.cart);
  const dispatch = useDispatch();
  const { total } = UseCartInfo();

  // Calculate totals
  const tax = subtotal * 0.1; // 10% tax
  const finalTotal = subtotal + shippingCost + tax;

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
          const options = await shippingService.getShippingOptions(address, cartItems);
          setShippingOptions(options);

          // Calculate shipping cost for selected option
          const cost = await shippingService.calculateShippingCost(
            cartItems,
            selectedShippingOption,
            address
          );
          setShippingCost(cost);
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

  // Handle shipping option change
  const handleShippingChange = async (optionId: string, price: number) => {
    setSelectedShippingOption(optionId);
    setShippingCost(price);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address || !formData.city || !formData.state || !formData.postalCode || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);

    try {
      // Create order data
      const orderData = {
        items: cartItems.map(item => ({
          id: item.product_id,
          name: item.product?.name || 'Product',
          price: item.product?.price || 0,
          quantity: item.quantity,
          image: item.product?.image_url
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
                    <form onSubmit={e => e.preventDefault()}>
                      <div className="tp-return-customer-input">
                        <label>Coupon Code :</label>
                        <input type="text" placeholder="Coupon" />
                      </div>
                      <button type="submit" className="tp-btn-theme"><span>Apply</span></button>
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
                              placeholder="Email Address"
                              required
                            />
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
                          {item.product?.name || 'Product'}
                          <span> ${item.product?.price || 0} x {item.quantity}</span>
                        </p>
                        <span>${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
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
                                {option.name}: <span>${option.price.toFixed(2)}</span>
                              </label>
                            </span>
                          ))
                        ) : (
                          <>
                            <span>
                              <input
                                id="flat_rate"
                                type="radio"
                                name="shipping"
                                checked={selectedShippingOption === 'flat_rate'}
                                onChange={() => handleShippingChange('flat_rate', 20)}
                              />
                              <label htmlFor="flat_rate">Flat rate: <span>$20.00</span></label>
                            </span>
                            <span>
                              <input
                                id="local_pickup"
                                type="radio"
                                name="shipping"
                                checked={selectedShippingOption === 'local_pickup'}
                                onChange={() => handleShippingChange('local_pickup', 25)}
                              />
                              <label htmlFor="local_pickup">Local pickup: <span>$25.00</span></label>
                            </span>
                            <span>
                              <input
                                id="free_shipping"
                                type="radio"
                                name="shipping"
                                checked={selectedShippingOption === 'free_shipping'}
                                onChange={() => handleShippingChange('free_shipping', 0)}
                              />
                              <label htmlFor="free_shipping">Free shipping</label>
                            </span>
                          </>
                        )}
                      </div>
                    </li>

                    <li className="tp-order-info-list-subtotal">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </li>

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
                      <p>Please send a check to our store address. Your order will not be shipped until we receive and process your payment.</p>
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
                </div>
                <div className="tp-checkout-agree">
                  <div className="tp-checkout-option">
                    <input id="read_all" type="checkbox" required />
                    <label htmlFor="read_all">I have read and agree to the website terms and conditions.</label>
                  </div>
                </div>
                <div className="tp-checkout-btn-wrapper">
                  <button
                    type="submit"
                    className="tp-btn-theme text-center w-100"
                    disabled={processing || cartLoading}
                    onClick={handleSubmit}
                  >
                    <span>{processing ? 'Processing...' : 'Place Order'}</span>
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