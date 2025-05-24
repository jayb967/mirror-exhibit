'use client'

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from 'next/navigation';
import { useGetSingleProductQuery } from '@/redux/features/productApi';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/redux/features/cartSlice';
import { toast } from 'react-toastify';
import OurProductArea from './OurProductArea';

const ShopDetailsArea = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Get the product ID from the URL query parameter
  const productId = searchParams.get('id');
  const dispatch = useDispatch();

  const { data, isLoading, isError } = useGetSingleProductQuery(productId);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [defaultOptions, setDefaultOptions] = useState({
    sizes: [],
    frameTypes: []
  });

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) {
      toast.error("Product information not available");
      return;
    }

    if (product.variations && product.variations.length > 0 && !selectedVariation) {
      toast.warning("Please select size and frame type");
      return;
    }

    const cartItem = {
      id: selectedVariation?.id || product.id,
      title: product.title,
      price: calculatedPrice,
      image: product.image,
      quantity: quantity,
      size: selectedSize,
      size_name: sizes.find(s => s.id === selectedSize)?.name || null,
      frame_type: selectedFrame,
      frame_name: frameTypes.find(f => f.id === selectedFrame)?.name || null,
      variation_id: selectedVariation?.id || null,
      product_id: product.id // Store original product ID
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.title} added to cart`);
  };

  // Get the product from the API response
  const product = data?.product;

  // Fetch default product options
  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        console.log('Fetching product options for product details...');
        const response = await fetch('/api/product-options');
        const data = await response.json();

        if (data.success) {
          console.log('Product options loaded for product details:', data);
          setDefaultOptions({
            sizes: data.sizes || [],
            frameTypes: data.frameTypes || []
          });
        }
      } catch (err) {
        console.error('Error fetching product options:', err);
      }
    };

    fetchProductOptions();
  }, []);

  // Group variations by size and frame type for easier selection, fallback to default options
  const sizes = product?.variations && product.variations.length > 0 ?
    [...new Set(product.variations.map(v => v.size?.name))]
      .filter(Boolean)
      .map(name => {
        const variation = product.variations.find(v => v.size?.name === name);
        return variation?.size;
      }) : defaultOptions.sizes;

  const frameTypes = product?.variations && product.variations.length > 0 ?
    [...new Set(product.variations.map(v => v.frame_type?.name))]
      .filter(Boolean)
      .map(name => {
        const variation = product.variations.find(v => v.frame_type?.name === name);
        return variation?.frame_type;
      }) : defaultOptions.frameTypes;

  // Set default selections when data loads - prioritize "Classic Wood" and "Small"
  useEffect(() => {
    if (sizes.length > 0 && frameTypes.length > 0) {
      if (!selectedSize) {
        const smallSize = sizes.find(size => size.name === 'Small');
        setSelectedSize(smallSize?.id || sizes[0]?.id || null);
      }
      if (!selectedFrame) {
        const classicWood = frameTypes.find(frame => frame.name === 'Classic Wood');
        setSelectedFrame(classicWood?.id || frameTypes[0]?.id || null);
      }
    }
  }, [sizes, frameTypes]);

  // Find the selected variation based on size and frame
  const selectedVariation = product?.variations?.find(
    v => v.size?.id === selectedSize && v.frame_type?.id === selectedFrame
  );

  // Calculate price with adjustments
  const calculatedPrice = useMemo(() => {
    const basePrice = product?.price || product?.base_price || 0;

    // If we have a specific variation, use its price
    if (selectedVariation) {
      return selectedVariation.price;
    }

    // Otherwise calculate from base price + adjustments
    const selectedSizeObj = sizes.find(s => s.id === selectedSize);
    const selectedFrameObj = frameTypes.find(f => f.id === selectedFrame);

    const sizeAdjustment = selectedSizeObj?.price_adjustment || 0;
    const frameAdjustment = selectedFrameObj?.price_adjustment || 0;

    return basePrice + sizeAdjustment + frameAdjustment;
  }, [product?.price, product?.base_price, selectedVariation, selectedSize, selectedFrame, sizes, frameTypes]);

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

  // Fallback product data in case the API is down
  const fallbackProduct = {
    id: productId || "1",
    title: "Elegant Wall Mirror",
    price: 199.99,
    description: "Elevate your space with our exquisite wall mirror, meticulously crafted to blend artistry with functionality. This statement piece features premium materials and expert craftsmanship, creating a perfect focal point that enhances natural light and adds depth to any room. The carefully designed frame complements various interior styles, from contemporary minimalist to classic elegance.",
    image: "/assets/img/logo/ME_Logo.png",
    brand: "Mirror Exhibit",
    category: "Wall Mirrors",
    variations: [
      {
        id: 1,
        sku: "ME-WM-001-S-W",
        price: 199.99,
        stock_quantity: 10,
        size: { id: 1, name: "Small", dimensions: "24\" x 36\"" },
        frame_type: { id: 1, name: "Wood", material: "Oak" }
      },
      {
        id: 2,
        sku: "ME-WM-001-M-W",
        price: 249.99,
        stock_quantity: 8,
        size: { id: 2, name: "Medium", dimensions: "36\" x 48\"" },
        frame_type: { id: 1, name: "Wood", material: "Oak" }
      },
      {
        id: 3,
        sku: "ME-WM-001-L-W",
        price: 299.99,
        stock_quantity: 5,
        size: { id: 3, name: "Large", dimensions: "48\" x 60\"" },
        frame_type: { id: 1, name: "Wood", material: "Oak" }
      },
      {
        id: 4,
        sku: "ME-WM-001-S-S",
        price: 229.99,
        stock_quantity: 12,
        size: { id: 1, name: "Small", dimensions: "24\" x 36\"" },
        frame_type: { id: 2, name: "Steel", material: "Brushed Steel" }
      },
      {
        id: 5,
        sku: "ME-WM-001-M-S",
        price: 279.99,
        stock_quantity: 7,
        size: { id: 2, name: "Medium", dimensions: "36\" x 48\"" },
        frame_type: { id: 2, name: "Steel", material: "Brushed Steel" }
      },
      {
        id: 6,
        sku: "ME-WM-001-L-S",
        price: 329.99,
        stock_quantity: 4,
        size: { id: 3, name: "Large", dimensions: "48\" x 60\"" },
        frame_type: { id: 2, name: "Steel", material: "Brushed Steel" }
      }
    ]
  };

  // Use fallback product if there's an error or no product data
  if (isError || !product) {
    console.error("Error loading product from API, using fallback data");
    // Override the product with fallback data
    const product = fallbackProduct;

    // Recalculate sizes and frame types from fallback data or use defaults
    const sizes = fallbackProduct.variations && fallbackProduct.variations.length > 0
      ? [...new Set(fallbackProduct.variations.map(v => v.size?.name))]
        .filter(Boolean)
        .map(name => {
          const variation = fallbackProduct.variations.find(v => v.size?.name === name);
          return variation?.size;
        })
      : defaultOptions.sizes;

    const frameTypes = fallbackProduct.variations && fallbackProduct.variations.length > 0
      ? [...new Set(fallbackProduct.variations.map(v => v.frame_type?.name))]
        .filter(Boolean)
        .map(name => {
          const variation = fallbackProduct.variations.find(v => v.frame_type?.name === name);
          return variation?.frame_type;
        })
      : defaultOptions.frameTypes;

    // Set default selections - prioritize "Classic Wood" and "Small"
    if (!selectedSize && sizes.length > 0) {
      const smallSize = sizes.find(size => size.name === 'Small');
      setSelectedSize(smallSize?.id || sizes[0]?.id);
    }

    if (!selectedFrame && frameTypes.length > 0) {
      const classicWood = frameTypes.find(frame => frame.name === 'Classic Wood');
      setSelectedFrame(classicWood?.id || frameTypes[0]?.id);
    }

    // Find the selected variation
    const selectedVariation = fallbackProduct.variations.find(
      v => v.size?.id === selectedSize && v.frame_type?.id === selectedFrame
    ) || fallbackProduct.variations[0];

    // Calculate price with adjustments for fallback
    const calculatedPrice = useMemo(() => {
      const basePrice = fallbackProduct.price || 0;

      // If we have a specific variation, use its price
      if (selectedVariation) {
        return selectedVariation.price;
      }

      // Otherwise calculate from base price + adjustments
      const selectedSizeObj = sizes.find(s => s.id === selectedSize);
      const selectedFrameObj = frameTypes.find(f => f.id === selectedFrame);

      const sizeAdjustment = selectedSizeObj?.price_adjustment || 0;
      const frameAdjustment = selectedFrameObj?.price_adjustment || 0;

      return basePrice + sizeAdjustment + frameAdjustment;
    }, [fallbackProduct.price, selectedVariation, selectedSize, selectedFrame, sizes, frameTypes]);

    // Continue with the UI using fallback data
    return (
      <div className="tp-product-details-area pt-130">
        <div className="container">
          <div className="row">
            <div className="col-12 mb-4 text-center">
              <div className="alert alert-warning">
                <p>We're experiencing some technical difficulties with our product database. Showing sample product information.</p>
              </div>
            </div>
          </div>

          {/* Rest of the UI using fallback data */}
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
                          src={fallbackProduct.image}
                          alt={fallbackProduct.title}
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
                  {fallbackProduct.title}
                </h3>
                <div className="tp-shop-details__price">
                  <span>${calculatedPrice.toFixed(2)}</span>
                  {calculatedPrice !== fallbackProduct.price && (
                    <del>${fallbackProduct.price?.toFixed(2)}</del>
                  )}
                  {(selectedSize || selectedFrame) && (
                    <div className="variation-details mt-2">
                      <small>
                        {selectedSize && sizes.find(s => s.id === selectedSize)?.name &&
                          <span>Size: {sizes.find(s => s.id === selectedSize)?.name}</span>}
                        {selectedFrame && frameTypes.find(f => f.id === selectedFrame)?.name &&
                          <span>{selectedSize ? ' | ' : ''}Frame: {frameTypes.find(f => f.id === selectedFrame)?.name}</span>}
                      </small>
                    </div>
                  )}
                </div>
                <div className="tp-shop-details__text-2">
                  <p>{fallbackProduct.description}</p>
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
                      <span>Brand:</span> {fallbackProduct.brand || 'Unknown Brand'}
                      {fallbackProduct.brand === 'Unknown Brand' && <span style={{ color: '#999' }}>Not specified</span>}
                    </li>
                    <li>
                      <span>Category:</span> {fallbackProduct.category || 'Uncategorized'}
                    </li>
                  </ul>
                </div>

                <div className="tp-shop-details__quantity-wrap mt-30 d-flex align-items-center">
                  <div className="tp-shop-details__btn mr-30">
                    <button
                      className="tp-btn-theme height"
                      onClick={handleAddToCart}
                      style={{ width: "205px" }}
                    >
                      Add To Cart
                    </button>
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
              </div>
            </div>
          </div>

          {/* Related Products */}
          <OurProductArea currentProductId={productId} />
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
                  <span>${calculatedPrice.toFixed(2)}</span>
                  {calculatedPrice !== (product.price || product.base_price) && (
                    <del>${(product.price || product.base_price)?.toFixed(2)}</del>
                  )}
                  {(selectedSize || selectedFrame) && (
                    <div className="variation-details mt-2">
                      <small>
                        {selectedSize && sizes.find(s => s.id === selectedSize)?.name &&
                          <span>Size: {sizes.find(s => s.id === selectedSize)?.name}</span>}
                        {selectedFrame && frameTypes.find(f => f.id === selectedFrame)?.name &&
                          <span>{selectedSize ? ' | ' : ''}Frame: {frameTypes.find(f => f.id === selectedFrame)?.name}</span>}
                      </small>
                    </div>
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
                      <span>Brand:</span> {product.brand || 'Unknown Brand'}
                      {/* Hide "Unknown Brand" text if it's the value */}
                      {product.brand === 'Unknown Brand' && <span style={{ color: '#999' }}>Not specified</span>}
                    </li>
                    <li>
                      <span>Category:</span> {product.category || 'Uncategorized'}
                    </li>
                  </ul>
                </div>

                <div className="tp-shop-details__quantity-wrap mt-30 d-flex align-items-center">
                  <div className="tp-shop-details__btn mr-30">
                    <button
                      className="tp-btn-theme height"
                      onClick={handleAddToCart}
                      style={{ width: "205px" }}
                    >
                      Add To Cart
                    </button>
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

          {/* Related Products */}
          <OurProductArea currentProductId={productId} />
        </div>
      </div>
    </>
  );
};

export default ShopDetailsArea;
