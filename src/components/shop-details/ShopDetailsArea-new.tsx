'use client'

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { useGetSingleProductQuery } from '@/redux/features/productApi';

const ShopDetailsArea = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const { data, isLoading, isError } = useGetSingleProductQuery(productId);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // Get the product from the API response
  const product = data?.product;
  
  // Group variations by size and frame type for easier selection
  const sizes = product?.variations ? 
    [...new Set(product.variations.map(v => v.size?.name))]
      .filter(Boolean)
      .map(name => {
        const variation = product.variations.find(v => v.size?.name === name);
        return variation?.size;
      }) : [];
      
  const frameTypes = product?.variations ? 
    [...new Set(product.variations.map(v => v.frame_type?.name))]
      .filter(Boolean)
      .map(name => {
        const variation = product.variations.find(v => v.frame_type?.name === name);
        return variation?.frame_type;
      }) : [];
  
  // Set default selections when data loads
  useEffect(() => {
    if (product?.variations?.length > 0) {
      setSelectedSize(sizes[0]?.id || null);
      setSelectedFrame(frameTypes[0]?.id || null);
    }
  }, [product]);
  
  // Find the selected variation based on size and frame
  const selectedVariation = product?.variations?.find(
    v => v.size?.id === selectedSize && v.frame_type?.id === selectedFrame
  );
  
  // Handle quantity changes
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);
  
  if (isLoading) {
    return (
      <div className="tp-product-details-area pt-130">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h3>Loading product details...</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError || !product) {
    return (
      <div className="tp-product-details-area pt-130">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h3>Error loading product details. Please try again later.</h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="tp-product-details-area pt-130">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <div className="tp-shop-details__wrapper">
                <div className="tp-shop-details__tab-content-box mb-20">
                  <div className="tab-content" id="nav-tabContent">
                    <div
                      className="tab-pane fade show active"
                      id="nav-one"
                      role="tabpanel"
                      aria-labelledby="nav-one-tab"
                    >
                      <div className="tp-shop-details__tab-big-img" style={{ position: 'relative', width: '100%', height: '500px' }}>
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill={true}
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                          priority={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="tp-shop-details__right-warp">
                <h3 className="tp-shop-details__title-sm">
                  {product.title}
                </h3>
                <div className="tp-shop-details__price">
                  <span>${selectedVariation?.price || product.price}</span>
                  {selectedVariation?.price !== product.price && (
                    <del>${product.price}</del>
                  )}
                </div>
                <div className="tp-shop-details__text-2">
                  <p>{product.description}</p>
                </div>
                <div className="tp-shop-details__product-info">
                  <ul>
                    {frameTypes.length > 0 && (
                      <li>
                        <span>Frame Type:</span>
                        <div className="tp-shop-details__size">
                          {frameTypes.map((frame) => (
                            <span 
                              key={frame.id}
                              className={selectedFrame === frame.id ? "active" : ""}
                              onClick={() => setSelectedFrame(frame.id)}
                            >
                              {frame.name}
                            </span>
                          ))}
                        </div>
                      </li>
                    )}
                    
                    {sizes.length > 0 && (
                      <li>
                        <span>Size:</span>
                        <div className="tp-shop-details__size">
                          {sizes.map((size) => (
                            <span 
                              key={size.id}
                              className={selectedSize === size.id ? "active" : ""}
                              onClick={() => setSelectedSize(size.id)}
                            >
                              {size.name}
                            </span>
                          ))}
                        </div>
                      </li>
                    )}
                    
                    <li>
                      <span>Brand:</span> {product.brand}
                    </li>
                    <li>
                      <span>Category:</span> {product.category}
                    </li>
                  </ul>
                </div>
                
                <div className="tp-shop-details__quantity-wrap mt-30 d-flex align-items-center">
                  <div className="tp-shop-details__btn mr-30">
                    <button className="tp-btn-theme height">Add To Cart</button>
                  </div>
                  <div className="tp-shop-details__quantity-box">
                    <div className="tp-shop-details__quantity">
                      <div className="tp-cart-minus" onClick={decreaseQuantity}>
                        <i className="fal fa-minus"></i>
                      </div>
                      <input type="text" value={quantity} readOnly />
                      <div className="tp-cart-plus" onClick={increaseQuantity}>
                        <i className="fal fa-plus"></i>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="tp-shop-details__social mt-30">
                  <span>Share:</span>
                  <a href="#">
                    <i className="fa-brands fa-facebook-f"></i>
                  </a>
                  <a href="#">
                    <i className="fa-brands fa-twitter"></i>
                  </a>
                  <a href="#">
                    <i className="fa-brands fa-linkedin-in"></i>
                  </a>
                  <a href="#">
                    <i className="fa-brands fa-pinterest"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="productdetails-tabs mb-100">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-12">
                  <div className="product-additional-tab">
                    <div className="pro-details-nav mb-40">
                      <ul
                        className="nav nav-tabs pro-details-nav-btn"
                        id="myTabs"
                        role="tablist"
                      >
                        <li className="nav-item" role="presentation">
                          <button
                            className="nav-links active"
                            id="home-tab-1"
                            data-bs-toggle="tab"
                            data-bs-target="#home-1"
                            type="button"
                            role="tab"
                            aria-controls="home-1"
                            aria-selected="true"
                          >
                            <span>Product Details</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div
                      className="tab-content tp-content-tab"
                      id="myTabContent-2"
                    >
                      <div
                        className="tab-para tab-pane fade show active"
                        id="home-1"
                        role="tabpanel"
                        aria-labelledby="home-tab-1"
                      >
                        <p className="mb-30">
                          {product.description}
                        </p>
                        
                        {selectedVariation && (
                          <div className="product-details-list-box">
                            <span>Product Details:</span>
                            <ul>
                              <li>
                                <span>
                                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                  </svg>
                                </span>
                                Brand: {product.brand}
                              </li>
                              <li>
                                <span>
                                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                  </svg>
                                </span>
                                Size: {selectedVariation.size?.name} ({selectedVariation.size?.dimensions})
                              </li>
                              <li>
                                <span>
                                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                  </svg>
                                </span>
                                Frame: {selectedVariation.frame_type?.name} ({selectedVariation.frame_type?.material})
                              </li>
                              <li>
                                <span>
                                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                  </svg>
                                </span>
                                SKU: {selectedVariation.sku}
                              </li>
                              <li>
                                <span>
                                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                  </svg>
                                </span>
                                Stock: {selectedVariation.stock_quantity} available
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {!selectedVariation && (
                          <div className="product-details-list-box">
                            <span>Product Information:</span>
                            <ul>
                              <li>
                                <span>
                                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                  </svg>
                                </span>
                                Brand: {product.brand}
                              </li>
                              <li>
                                <span>
                                  <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                  </svg>
                                </span>
                                Category: {product.category}
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopDetailsArea;
