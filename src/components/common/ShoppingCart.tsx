
'use client'

import UseCartInfo from '@/hooks/UseCartInfo';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import empty_bag from "@/assets/img/bag/empty-cart.webp";
import { remove_cart_product } from '@/redux/features/cartSlice';


const ShoppingCart = () => {



  const productItem = useSelector((state: any) => state.cart.cart);
  const dispatch = useDispatch();
  const { total } = UseCartInfo();


  let content = null;
  if (productItem.length === 0) content = <div>
    <div className="empty_bag text-center">
      <Image src={empty_bag} style={{ width: "150px", height: "auto" }} alt="empty-bag" />
      <p className="py-3">Your Bag is Empty</p>
      <Link className="tp-btn-theme height-2 w-100 mb-2" href="/shop"><span>Go To Shop</span></Link>
    </div>
  </div>

  let totalPrice = null;
  if (productItem.length) totalPrice = (
    <div className="tpcart__total-price d-flex justify-content-between align-items-center">
      <span> Subtotal:</span>
      <span className="heilight-price"> ${total}.00</span>
    </div>
  )



  return (
    <>
      <div className="minicart">
        {content}
        {productItem.map((item: any, i: number) => (
          <div key={i} className="cart-content-wrap d-flex align-items-center justify-content-between">
            <div className="cart-img-info d-flex align-items-center">
              <div className="cart-thumb">
                <Link href={`/shop-details`}>
                  <Image src={item.img} width={80} height={80} alt="image" />
                </Link>
              </div>
              <div className="cart-content">
                <h5 className="cart-title">
                  <Link href={`/shop-details`}>
                    {item.title}
                  </Link>
                </h5>

                <div className="tpcart__cart-price">
                  <span className="quantity">{item.quantity} x </span>
                  <span className="new-price">${item.price}</span>
                </div>

              </div>
            </div>
            <div className="cart-del-icon">
              <span><i className="fa-light fa-trash-can" onClick={() => dispatch(remove_cart_product(item))}></i></span>
            </div>
          </div>
        ))}

        {totalPrice}
        {productItem.length ?
          <>
            <div className="cart-btn mb-1">
              <Link className="tp-btn-black w-100" href="/cart"><span>View Cart</span></Link>
            </div>
            <div className="cart-btn">
              <Link className="tp-btn-black w-100" href="/checkout"><span>Checkout</span></Link>
            </div>
          </>
          : null

        }




      </div>
    </>
  );
};

export default ShoppingCart;