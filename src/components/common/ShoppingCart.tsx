
'use client'

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { remove_cart_product } from '@/redux/features/cartSlice';
import empty_bag from "@/assets/img/bag/empty-cart.webp";
import { HiTrash } from 'react-icons/hi';

const ShoppingCart = () => {
  const dispatch = useDispatch();

  // Get cart data from Redux
  const cartItems = useSelector((state: any) => state.cart.cart);

  // Calculate subtotal from Redux cart
  const subtotal = cartItems.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Handle remove from cart
  const handleRemoveFromCart = (item: any) => {
    dispatch(remove_cart_product({
      id: item.id || item.variation_id || item.product_id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      variation_id: item.variation_id,
      product_id: item.product_id,
      size_name: item.size_name,
      frame_name: item.frame_name
    }));
  };

  let content = null;
  if (cartItems.length === 0) content = <div>
    <div className="empty_bag text-center">
      <Image src={empty_bag} style={{ width: "150px", height: "auto" }} alt="empty-bag" />
      <p className="py-3">Your Bag is Empty</p>
      <Link className="tp-btn-theme height-2 w-100 mb-2" href="/shop"><span>Go To Shop</span></Link>
    </div>
  </div>

  let totalPrice = null;
  if (cartItems.length) totalPrice = (
    <div className="tpcart__total-price d-flex justify-content-between align-items-center mt-3 mb-3">
      <span className="fw-bold"> Subtotal:</span>
      <span className="heilight-price fw-bold"> ${subtotal.toFixed(2)}</span>
    </div>
  )



  return (
    <>
      <div className="minicart">
        {content}
        {cartItems.map((item: any, i: number) => (
          <div key={i} className="cart-content-wrap d-flex align-items-center justify-content-between">
            <div className="cart-img-info d-flex align-items-center">
              <div className="cart-thumb">
                <Link href={`/product/${item.product_id || item.id || ''}`}>
                  <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#f8f8f8' }}>
                    {/* Use a static image with fixed dimensions instead of fill */}
                    <Image
                      src={item.image || '/assets/img/logo/ME_Logo.png'}
                      width={80}
                      height={80}
                      alt={item.title || 'Product'}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      unoptimized={true}
                    />
                  </div>
                </Link>
              </div>
              <div className="cart-content">
                <h5 className="cart-title">
                  <Link href={`/product/${item.product_id || item.id || ''}`}>
                    {item.title || `Product #${(item.product_id || item.id || 'Unknown').toString().substring(0, 8)}`}
                  </Link>
                </h5>

                {/* Show variation details if available */}
                {(item.size_name || item.frame_name) && (
                  <div className="variation-details" style={{ fontSize: '0.8rem', color: '#666' }}>
                    {item.size_name && <span>Size: {item.size_name}</span>}
                    {item.size_name && item.frame_name && <span> | </span>}
                    {item.frame_name && <span>Frame: {item.frame_name}</span>}
                  </div>
                )}

                <div className="tpcart__cart-price">
                  <span className="quantity">{item.quantity} x </span>
                  <span className="new-price">${item.price ? item.price.toFixed(2) : '0.00'}</span>
                </div>

              </div>
            </div>
            <div className="cart-del-icon">
              <button
                onClick={() => handleRemoveFromCart(item)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HiTrash style={{ fontSize: '16px', color: '#666' }} />
              </button>
            </div>
          </div>
        ))}

        {totalPrice}
        {cartItems.length ?
          <>
            <div className="cart-btn mb-1">
              <Link className="tp-btn-black w-100 d-flex align-items-center justify-content-center" href="/cart"><span>View Cart</span></Link>
            </div>
            <div className="cart-btn">
              <Link className="tp-btn-theme w-100 d-flex align-items-center justify-content-center" href="/checkout"><span>Checkout</span></Link>
            </div>
          </>
          : null

        }




      </div>
    </>
  );
};

export default ShoppingCart;