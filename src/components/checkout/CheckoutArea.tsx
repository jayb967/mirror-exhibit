
'use client'

import UseCartInfo from '@/hooks/UseCartInfo';
import NiceSelect from '@/ui/NiceSelect';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const CheckoutArea = () => {
  const selectHandler = (e: any) => { };



  const [activeLogin, setActiveLopin] = useState(false)
  const handleActiveLogin = () => {
    setActiveLopin(!activeLogin)
  }

  const [activeCoupon, setActiveCoupon] = useState(false)
  const handleActiveCoupon = () => {
    setActiveCoupon(!activeCoupon)
  }


  const [bankOpen, setBankOpen] = useState<boolean>(false)
  const [chequeOpen, setChequeOpen] = useState<boolean>(false)
  const [cashOpen, setCashOpen] = useState<boolean>(false)



  const productItem = useSelector((state: any) => state.cart.cart);
  const dispatch = useDispatch();
  const { total } = UseCartInfo();

   // handle shipping cost 
   const [shipCost, setShipCost] = useState<number>(0);
   const handleShippingCost = (value: any) => {
     if (value === 'free') {
       setShipCost(0)
     }
     else {
       setShipCost(value)
     }
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
                  <form onSubmit={e => e.preventDefault()}>
                    <div className="tp-checkout-bill-inner">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="tp-checkout-input">
                            <label>First Name <span>*</span></label>
                            <input type="text" placeholder="First Name" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="tp-checkout-input">
                            <label>Last Name <span>*</span></label>
                            <input type="text" placeholder="Last Name" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Company name (optional)</label>
                            <input type="text" placeholder="Example LTD." />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Country / Region </label>
                            <input type="text" placeholder="United States (US)" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Street address</label>
                            <input type="text" placeholder="House number and street name" />
                          </div>

                          <div className="tp-checkout-input">
                            <input type="text" placeholder="Apartment, suite, unit, etc. (optional)" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Town / City</label>
                            <input type="text" placeholder="" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="tp-checkout-input">
                            <label>State / County</label>
                            <NiceSelect
                              className="input-fieldf"
                              options={[
                                { value: "01", text: "New York US" },
                                { value: "02", text: "Berlin Germany" },
                                { value: "03", text: "Paris France" },
                                { value: "04", text: "Tokiyo Japan" },
                              ]}
                              defaultCurrent={0}
                              onChange={selectHandler}
                              name=""
                              placeholder="" />

                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="tp-checkout-input">
                            <label>Postcode ZIP</label>
                            <input type="text" placeholder="" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Phone <span>*</span></label>
                            <input type="text" placeholder="" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Email address <span>*</span></label>
                            <input type="email" placeholder="" />
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-option-wrapper">
                            <div className="tp-checkout-option">
                              <input id="create_free_account" type="checkbox" />
                              <label htmlFor="create_free_account">Create an account?</label>
                            </div>
                            <div className="tp-checkout-option">
                              <input id="ship_to_diff_address" type="checkbox" />
                              <label htmlFor="ship_to_diff_address">Ship to a different address?</label>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12">
                          <div className="tp-checkout-input">
                            <label>Order notes (optional)</label>
                            <textarea placeholder="Notes about your order, e.g. special notes for delivery."></textarea>
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


                    {productItem.map((add_item: any, add_index: any) =>
                      <li key={add_index} className="tp-order-info-list-desc">
                        <p>{add_item.title} <span> {add_item.price} x {add_item.quantity}</span></p>

                        <span>${add_item.quantity * add_item.price}:00</span>
                      </li>
                    )} 


                    <li className="tp-order-info-list-subtotal">
                      <span>Subtotal</span>
                      <span>${total}.00</span>
                    </li>


                    <li className="tp-order-info-list-shipping">
                      <span>Shipping</span>
                      <div className="tp-order-info-list-shipping-item d-flex flex-column align-items-end">
                        <span>
                          <input id="flat_rate" type="radio" name="shipping" />
                          <label htmlFor="flat_rate" onClick={() => handleShippingCost(20)}>Flat rate: <span>$20.00</span></label>
                        </span>
                        <span>
                          <input id="local_pickup" type="radio" name="shipping" />
                          <label htmlFor="local_pickup" onClick={() => handleShippingCost(25)}>Local pickup: <span>$25.00</span></label>
                        </span>
                        <span>
                          <input id="free_shipping" type="radio" name="shipping" />
                          <label htmlFor="free_shipping" onClick={() => handleShippingCost('free')}>Free shipping</label>
                        </span>
                      </div>
                    </li>


                    <li className="tp-order-info-list-total">
                      <span>Total</span>
                      <span>${total + shipCost}.00</span>
                    </li>
                  </ul>
                </div>
                <div className="tp-checkout-payment">
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
                      <p>Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.</p>
                    </div>
                  </div>
                  <div className="tp-checkout-payment-item">
                    <input type="radio" id="cod" name="payment" />
                    <label htmlFor="cod" onClick={() => setCashOpen(!cashOpen)}>Cash on Delivery</label>
                    <div className="tp-checkout-payment-desc cash-on-delivery" style={{ display: cashOpen ? 'block' : '' }}>
                      <p>Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.</p>
                    </div>
                  </div>
                  <div className="tp-checkout-payment-item paypal-payment">
                    <input type="radio" id="paypal" name="payment" />
                    <label htmlFor="paypal">PayPal <img src="assets/img/icon/payment-option.png" alt="" /> <a href="#">What is PayPal?</a></label>
                  </div>
                </div>
                <div className="tp-checkout-agree">
                  <div className="tp-checkout-option">
                    <input id="read_all" type="checkbox" />
                    <label htmlFor="read_all">I have read and agree to the website.</label>
                  </div>
                </div>
                <div className="tp-checkout-btn-wrapper">
                  <a href="#" className="tp-btn-theme text-center w-100"><span>Place Order</span></a>
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