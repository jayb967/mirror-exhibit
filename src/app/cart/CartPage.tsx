'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import FreeShippingProgress from '@/components/cart/FreeShippingProgress';
import { Coupon } from '@/services/couponService';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToCart as reduxAddToCart,
  decrease_quantity as reduxDecreaseQuantity,
  remove_cart_product as reduxRemoveProduct,
  clear_cart as reduxClearCart,
  apply_coupon,
  remove_coupon
} from '@/redux/features/cartSlice';
import '@/styles/mobile-cart.css';

const CartPage = () => {
  const dispatch = useDispatch();

  // Get Redux cart data
  const cartItems = useSelector((state: any) => state.cart.cart);
  const appliedCoupon = useSelector((state: any) => state.cart.appliedCoupon);
  const discount = useSelector((state: any) => state.cart.discount);

  // Calculate totals from Redux cart
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  // Removed shipping options - will be handled on checkout page

  // Handle quantity change
  const handleQuantityChange = (productId: string, newQuantity: number, item: any) => {
    if (newQuantity < 1) return;

    // Update Redux store
    if (newQuantity > item.quantity) {
      // Increasing quantity
      dispatch(reduxAddToCart({
        id: item.id || item.variation_id || productId,
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: 1,
        variation_id: item.variation_id,
        product_id: item.product_id || productId,
        size_name: item.size_name,
        frame_name: item.frame_name,
        silent: true // Don't show toast notifications
      }));
    } else {
      // Decreasing quantity
      dispatch(reduxDecreaseQuantity({
        id: item.id || item.variation_id || productId,
        title: item.title,
        price: item.price,
        quantity: 1,
        variation_id: item.variation_id,
        product_id: item.product_id || productId,
        size_name: item.size_name,
        frame_name: item.frame_name,
        silent: true // Don't show toast notifications
      }));
    }
  };

  // Handle item removal
  const handleRemoveItem = (productId: string, item: any) => {
    if (confirm('Are you sure you want to remove this item?')) {
      // Remove from Redux store
      dispatch(reduxRemoveProduct({
        id: item.id || item.variation_id || productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        variation_id: item.variation_id,
        product_id: item.product_id || productId,
        size_name: item.size_name,
        frame_name: item.frame_name
      }));
    }
  };

  // Shipping will be handled on checkout page

  // Handle coupon application
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      // Show loading state
      setIsApplyingCoupon(true);
      setCouponError(null);
      setCouponSuccess(null);

      // Use API for validation to ensure server-side rules are applied
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
          hasCartItems: cartItems.length > 0
        })
      });

      const data = await response.json();

      if (!response.ok || !data.isValid) {
        setCouponError(data.error || 'Invalid coupon code');
        toast.error(data.error || 'Invalid coupon code');
        return;
      }

      // Coupon is valid
      const formatDiscount = (coupon: Coupon): string => {
        if (coupon.discount_type === 'percentage') {
          return `${coupon.discount_value}% off`;
        } else {
          return `$${coupon.discount_value.toFixed(2)} off`;
        }
      };

      const successMessage = `Coupon applied: ${formatDiscount(data.coupon)}`;
      setCouponSuccess(successMessage);

      // Apply coupon to Redux store
      dispatch(apply_coupon({ coupon: data.coupon, discount: data.discount }));
      setCouponCode('');

      // Show success toast
      toast.success(successMessage);
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Error applying coupon');
      toast.error('Error applying coupon');
    } finally {
      // Hide loading state
      setIsApplyingCoupon(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponError(null);
    setCouponSuccess(null);

    // Remove coupon from Redux store
    dispatch(remove_coupon());
  };

  // Calculate final total (shipping will be added on checkout page)
  const finalTotal = total - discount;

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <section className="cart-area pt-120 pb-120">
        <div className="container">
          <h1 className="tp-section-title mb-30">Your Cart</h1>
          <div className="text-center py-50">
            <h3 className="mb-20">Your cart is empty</h3>
            <p className="mb-30">Looks like you haven&apos;t added any items to your cart yet.</p>
            <Link
              className="tp-btn-theme"
              href="/shop"
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '15px 30px',
                textDecoration: 'none',
                height: '50px',
                lineHeight: '1'
              }}
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-area pt-120 pb-120">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {/* Continue Shopping Button */}
            <div className="mb-4">
              <div
                onClick={() => window.location.href = '/shop'}
                style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  display: 'table-cell',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  height: '50px',
                  width: '200px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                Continue Shopping
              </div>
            </div>

            <form onSubmit={e => e.preventDefault()}>
              {/* Mobile-First Card Layout */}
              <div className="cart-items-container">
                {cartItems.map((item: any) => {
                  // Create unique key that includes variation info
                  const uniqueKey = item.variation_id ||
                    `${item.product_id || item.id}-${item.size_name || 'default'}-${item.frame_name || 'default'}`;

                  return (
                  <div key={uniqueKey} className="cart-item-card">
                    <div className="cart-item-content">
                      {/* Product Image */}
                      <div className="cart-item-image">
                        <Link href={`/product/${item.product_id || item.id}`}>
                          <Image
                            width={120}
                            height={120}
                            src={item.image || '/assets/img/logo/ME_Logo.png'}
                            alt={item.title || 'Product'}
                            style={{ objectFit: 'cover' }}
                          />
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="cart-item-details">
                        <div className="cart-item-header">
                          <div className="cart-item-title-container">
                            <h4 className="cart-item-title">
                              <Link href={`/product/${item.product_id || item.id}`}>
                                {item.title}
                              </Link>
                            </h4>
                            {/* Show variation details if available - stacked below title */}
                            {(item.size_name || item.frame_name) && (
                              <div className="product-options">
                                {item.size_name && (
                                  <span className="option-item">Size: {item.size_name}</span>
                                )}
                                {item.frame_name && (
                                  <span className="option-item">Frame: {item.frame_name}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            className="cart-item-remove"
                            onClick={() => handleRemoveItem(item.product_id || item.id, item)}
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </div>

                        <div className="cart-item-price">
                          <span className="price-label">Price: </span>
                          <span className="price-amount">${item.price.toFixed(2)}</span>
                        </div>

                        <div className="cart-item-actions">
                          <div className="quantity-controls">
                            <button
                              className="qty-btn qty-minus"
                              onClick={() => handleQuantityChange(item.product_id || item.id, item.quantity - 1, item)}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <input
                              className="qty-input"
                              type="text"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              className="qty-btn qty-plus"
                              onClick={() => handleQuantityChange(item.product_id || item.id, item.quantity + 1, item)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div className="item-total">
                            <span className="total-label">Total: </span>
                            <span className="total-amount">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="cart-actions-section">
                    <div className="coupon-section">
                      <div className="coupon-input-group">
                        <input
                          type="text"
                          className="coupon-input"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button
                          className="coupon-btn"
                          name="apply_coupon"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon}
                        >
                          {isApplyingCoupon ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              <span>Checking...</span>
                            </>
                          ) : (
                            <span>Apply</span>
                          )}
                        </button>
                      </div>

                      {/* Coupon notifications */}
                      <div className="coupon-notifications">
                        {couponError && (
                          <div className="coupon-error" style={{ color: '#B59410', fontSize: '14px', marginTop: '8px' }}>
                            {couponError}
                          </div>
                        )}
                        {couponSuccess && (
                          <div className="coupon-success-container" style={{ marginTop: '8px' }}>
                            <div className="coupon-success" style={{ color: '#000', fontSize: '14px', marginBottom: '8px' }}>
                              {couponSuccess}
                            </div>
                            <button
                              className="remove-coupon bg-transparent border-0"
                              onClick={handleRemoveCoupon}
                              style={{
                                color: '#B59410',
                                fontSize: '14px',
                                padding: '0',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                              }}
                            >
                              Remove coupon
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="cart-clear-section">
                      <button
                        className="clear-cart-btn"
                        name="update_cart"
                        onClick={() => {
                          dispatch(reduxClearCart()); // Clear Redux store
                        }}
                      >
                        <span>Clear Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row justify-content-end">
                <div className="col-xl-5 col-lg-6 col-md-8 col-12">
                  <div className="cart-page-total">
                    <h2>Cart totals</h2>
                    <ul className="mb-20">
                      <li>Subtotal <span>${subtotal.toFixed(2)}</span></li>

                      {/* Free Shipping Progress */}
                      <div className="mb-3">
                        <FreeShippingProgress
                          subtotal={subtotal}
                          cartItems={cartItems}
                        />
                      </div>

                      {/* Shipping options removed - will be handled on checkout page */}

                      {appliedCoupon && (
                        <li>Discount <span>-${discount.toFixed(2)}</span></li>
                      )}

                      <li>Total <span>${finalTotal.toFixed(2)}</span></li>
                    </ul>
                    <Link
                      className="tp-btn-theme text-center w-100"
                      href="/checkout"
                      style={{
                        backgroundColor: '#B59410',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '50px',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      <span>Proceed to checkout</span>
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
