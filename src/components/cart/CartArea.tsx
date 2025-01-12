
'use client'

import UseCartInfo from '@/hooks/UseCartInfo';
import { addToCart, clear_cart, decrease_quantity, remove_cart_product } from '@/redux/features/cartSlice';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const CartArea = () => {

  const productItem = useSelector((state: any) => state.cart.cart);
  const dispatch = useDispatch();
  const { total } = UseCartInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the form submission here
  };

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
      <section className="cart-area pt-120 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <form onSubmit={e => e.preventDefault()}>
                <div className="table-content table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="product-thumbnail">Images</th>
                        <th className="cart-product-name">Product</th>
                        <th className="product-price">Unit Price</th>
                        <th className="product-quantity">Quantity</th>
                        <th className="product-subtotal">Total</th>
                        <th className="product-remove">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productItem.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="product-thumbnail">
                            <Link href="/shop-details">
                              <Image style={{ width: "100px", height: "100px" }} src={item.img} alt="" />
                            </Link>
                          </td>
                          <td className="product-name">
                            <Link href="/shop-details">{item.title}</Link>
                          </td>
                          <td className="product-price"><span className="amount">${item.price}.00</span></td>
                          <td className="product-quantity text-center">
                            <div className="tp-shop-quantity">
                              <div className="tp-quantity p-relative">
                                <div className="qty_button cart-minus tp-cart-minus"><i onClick={() => dispatch(decrease_quantity(item))} className="fal fa-minus"></i></div>
                                <input className="tp-cart-input" type="text" onChange={handleSubmit} value={item.quantity} readOnly />
                                <div className="qty_button cart-plus tp-cart-plus"><i onClick={() => dispatch(addToCart(item))} className="fal fa-plus"></i></div>
                              </div>
                            </div>
                          </td>
                          <td className="product-subtotal"><span className="amount">${item.price}.00</span></td>
                          <td className="product-remove"><a  style={{ cursor: "pointer" }} onClick={() => dispatch(remove_cart_product(item))}><i className="fa fa-times"></i> Remove</a></td>
                        </tr>
                      ))} 

                    </tbody>
                  </table>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="coupon-all">
                      <div className="coupon d-flex align-items-center justify-content-between">
                        <input type="text" className="#coupon-code" placeholder="coupon code" />
                        <button className="tp-btn-theme" name="apply_coupon"><span>Apply coupon</span></button>
                      </div>
                      <div className="coupon2">
                        <button className="tp-btn-theme" name="update_cart" onClick={() => dispatch(clear_cart())}><span>Clear cart</span></button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row justify-content-end">
                  <div className="col-xl-5 col-lg-5 col-md-7">
                    <div className="cart-page-total">
                      <h2>Cart totals</h2>
                      <ul className="mb-20">
                        <li>Subtotal <span>${total}.00</span></li>

                        <li>
                          <input id="flat_rate" type="radio" name="shipping" /> {' '}
                          <label htmlFor="flat_rate" onClick={() => handleShippingCost(20)}>Flat rate: <span>$20.00</span></label>
                        </li>
                        <li>
                          <input id="local_pickup" type="radio" name="shipping" /> {' '}
                          <label htmlFor="local_pickup" onClick={() => handleShippingCost(25)}>Local pickup: <span> $25.00</span></label>
                        </li>
                        <li>
                          <input id="free_shipping" type="radio" name="shipping" /> {' '}
                          <label htmlFor="free_shipping" onClick={() => handleShippingCost('free')}>Free shipping</label>
                        </li> 

                        <li>Total <span>${total + shipCost}.00</span></li>
                      </ul>
                      <Link className="tp-btn-theme text-center w-100" href="/checkout"><span>Proceed to checkout</span></Link>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CartArea;