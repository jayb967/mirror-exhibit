'use client'

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';
import { useGetSingleProductQuery } from '@/redux/features/productApi';
import { useDispatch } from 'react-redux';
import { addToCartWithAuth } from '@/redux/features/cartSlice';
import { toast } from 'react-toastify';
import OurProductArea from './OurProductArea';

const ShopDetailsArea = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  const dispatch = useDispatch();

  const { data, isLoading, isError } = useGetSingleProductQuery(productId);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  const [defaultOptions, setDefaultOptions] = useState({
    sizes: [],
    frameTypes: []
  });
  const [productFaqs, setProductFaqs] = useState([]);

  // Fallback product data (moved up to be available for useMemo dependencies)
  const fallbackProduct = {
    id: productId || "1",
    title: "Elegant Wall Mirror",
    price: 199.99,
    description: "Elevate your space with our exquisite wall mirror, meticulously crafted to blend artistry with functionality.",
    image: "/assets/img/logo/ME_Logo.png",
    brand: "Mirror Exhibit",
    category: "Wall Mirrors",
    variations: []
  };

  const productToUse = data?.product || fallbackProduct;

  // Get the product from the API response
  const product = data?.product;

  // Fetch default product options and FAQs
  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        const response = await fetch('/api/product-options');
        const data = await response.json();
        if (data.success) {
          setDefaultOptions({
            sizes: data.sizes || [],
            frameTypes: data.frameTypes || []
          });
        }
      } catch (err) {
        console.error('Error fetching product options:', err);
      }
    };

    const fetchProductFaqs = async () => {
      try {
        const response = await fetch('/api/faqs?type=product');
        const data = await response.json();
        if (data.faqs) {
          setProductFaqs(data.faqs);
        }
      } catch (err) {
        console.error('Error fetching product FAQs:', err);
      }
    };

    fetchProductOptions();
    fetchProductFaqs();
  }, []);

  // Group variations by size and frame type for easier selection
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

  // Set default selections when data loads
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
    if (selectedVariation) {
      return selectedVariation.price;
    }
    const selectedSizeObj = sizes.find(s => s.id === selectedSize);
    const selectedFrameObj = frameTypes.find(f => f.id === selectedFrame);
    const sizeAdjustment = selectedSizeObj?.price_adjustment || 0;
    const frameAdjustment = selectedFrameObj?.price_adjustment || 0;
    return basePrice + sizeAdjustment + frameAdjustment;
  }, [product?.price, product?.base_price, selectedVariation, selectedSize, selectedFrame, sizes, frameTypes]);

  // Get all available images with fallback to logo
  const allImages = useMemo(() => {
    const images = [];
    if (product?.product_images && product.product_images.length > 0) {
      // Create a copy of the array before sorting to avoid mutating read-only data
      const sortedImages = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);
      // Apply fallback logic to each image
      const imagesWithFallback = sortedImages.map(img => ({
        ...img,
        image_url: img.image_url || '/assets/img/logo/ME_Logo.png'
      }));
      images.push(...imagesWithFallback);
    }
    if (images.length === 0) {
      // Use product image or fallback to logo
      const imageUrl = product?.image || product?.image_url || '/assets/img/logo/ME_Logo.png';
      images.push({
        id: 'main',
        product_id: product?.id || productId,
        image_url: imageUrl,
        alt_text: product?.title || 'Elegant Wall Mirror',
        sort_order: 1,
        is_primary: true,
        created_at: new Date().toISOString()
      });
    }
    return images;
  }, [product, productId, productToUse]);

  const currentImage = allImages[selectedImageIndex] || allImages[0];

  // Handle image error by setting fallback
  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => ({ ...prev, [imageUrl]: true }));
  };

  // Get image source with fallback logic
  const getImageSrc = (imageUrl: string) => {
    if (imageErrors[imageUrl] || !imageUrl) {
      return '/assets/img/logo/ME_Logo.png';
    }
    return imageUrl;
  };

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
      product_id: product.id
    };
    dispatch(addToCartWithAuth(cartItem));
    toast.success(`${product.title} added to cart`);
  };

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



  return (
    <>
      <div className="tp-product-details-area pt-130">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <div className="tp-shop-details__wrapper">
                <div className="tp-shop-details__tab-content-box mb-20">
                  <div className="tab-content" id="nav-tabContent">
                    <div className="tab-pane fade show active" id="nav-one" role="tabpanel" aria-labelledby="nav-one-tab">
                      <div className="tp-shop-details__tab-big-img" style={{ position: 'relative', width: '100%', height: '500px' }}>
                        {currentImage ? (
                          <Image
                            src={getImageSrc(currentImage.image_url)}
                            alt={currentImage.alt_text || productToUse.title}
                            fill={true}
                            style={{ objectFit: 'cover', objectPosition: 'center' }}
                            priority={true}
                            onError={() => handleImageError(currentImage.image_url)}
                          />
                        ) : (
                          <Image
                            src={getImageSrc(productToUse.image)}
                            alt={productToUse.title}
                            fill={true}
                            style={{ objectFit: 'cover', objectPosition: 'center' }}
                            priority={true}
                            onError={() => handleImageError(productToUse.image)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Thumbnails */}
                {allImages.length > 1 && (
                  <div className="tp-shop-details__tab-btn-box d-flex flex-wrap">
                    {allImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`tp-shop-details__tab-btn ${index === selectedImageIndex ? 'active' : ''}`}
                        style={{
                          position: 'relative',
                          width: '80px',
                          height: '80px',
                          marginRight: '10px',
                          marginBottom: '10px',
                          border: index === selectedImageIndex ? '2px solid #000' : '1px solid #ddd',
                          overflow: 'hidden'
                        }}
                      >
                        <Image
                          src={getImageSrc(image.image_url)}
                          alt={image.alt_text || `${productToUse.title} ${index + 1}`}
                          fill={true}
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                          sizes="80px"
                          onError={() => handleImageError(image.image_url)}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="tp-shop-details__right-warp">
                <h3 className="tp-shop-details__title-sm">
                  {productToUse.title}
                </h3>
                <div className="tp-shop-details__price">
                  <span>${calculatedPrice.toFixed(2)}</span>
                  {calculatedPrice !== (productToUse.price || productToUse.base_price) && (
                    <del>${(productToUse.price || productToUse.base_price)?.toFixed(2)}</del>
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
                  <p>{productToUse.description}</p>
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
                      <span>Brand:</span> {productToUse.brand || 'Unknown Brand'}
                    </li>
                    <li>
                      <span>Category:</span> {productToUse.category || 'Uncategorized'}
                    </li>
                  </ul>
                </div>

                <div className="tp-shop-details__quantity-wrap mt-30 d-flex align-items-center">
                  <div className="tp-shop-details__btn mr-30">
                    <button
                      className="tp-btn-theme"
                      onClick={handleAddToCart}
                      style={{
                        width: "205px",
                        height: "67px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: "1"
                      }}
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

          {/* Product Details Tabs */}
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-shop-details__bottom-area">
                <div className="container">
                  <div className="row">
                    <div className="col-xl-12">
                      <div className="tp-shop-details__bottom-wrapper">
                        <div className="pro-details-nav mb-40">
                          <ul
                            className="nav nav-tabs pro-details-nav-btn"
                            id="myTabs"
                            role="tablist"
                          >
                            <li className="nav-item" role="presentation">
                              <button
                                className={`nav-links ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                                type="button"
                                role="tab"
                              >
                                <span>Description</span>
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button
                                className={`nav-links ${activeTab === 'additional' ? 'active' : ''}`}
                                onClick={() => setActiveTab('additional')}
                                type="button"
                                role="tab"
                              >
                                <span>Additional Info</span>
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button
                                className={`nav-links ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                                type="button"
                                role="tab"
                              >
                                <span>Review (0)</span>
                              </button>
                            </li>
                            <li className="nav-item" role="presentation">
                              <button
                                className={`nav-links ${activeTab === 'faq' ? 'active' : ''}`}
                                onClick={() => setActiveTab('faq')}
                                type="button"
                                role="tab"
                              >
                                <span>FAQ</span>
                              </button>
                            </li>
                          </ul>
                        </div>

                        <div className="tab-content tp-content-tab" id="myTabContent-2">
                          {/* Description Tab */}
                          {activeTab === 'details' && (
                            <div className="tab-para tab-pane fade show active">
                              <p className="mb-30" style={{ fontSize: '16px', lineHeight: '1.6', color: '#666' }}>
                                {productToUse.description || 'No description available for this product.'}
                              </p>
                            </div>
                          )}

                          {/* Additional Info Tab */}
                          {activeTab === 'additional' && (
                            <div className="tab-para tab-pane fade show active">

                              <div className="product-details-list-box">
                                <span>Specifications:</span>
                                <ul>
                                  <li>
                                    <span>
                                      <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                      </svg>
                                    </span>
                                    Material: Premium glass with protective coating
                                  </li>
                                  <li>
                                    <span>
                                      <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                      </svg>
                                    </span>
                                    Installation: Wall-mounted
                                  </li>
                                  <li>
                                    <span>
                                      <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M15.794 2.17595C14.426 3.42395 13.094 4.87595 11.798 6.53195C10.67 7.95995 9.656 9.42395 8.756 10.924C7.94 12.268 7.346 13.42 6.974 14.38C6.962 14.416 6.938 14.446 6.902 14.47C6.866 14.506 6.824 14.524 6.776 14.524C6.764 14.536 6.752 14.542 6.74 14.542C6.656 14.542 6.596 14.518 6.56 14.47L0.134 7.93595C0.122 7.92395 0.278 7.76795 0.602 7.46795C0.926 7.15595 1.244 6.87395 1.556 6.62195C1.904 6.33395 2.09 6.20195 2.114 6.22595L5.642 8.99795C6.674 7.78595 7.832 6.58595 9.116 5.39795C11.048 3.62195 13.04 2.10995 15.092 0.861953C15.128 0.861953 15.266 1.02995 15.506 1.36595L15.866 1.88795C15.878 1.93595 15.878 1.98995 15.866 2.04995C15.854 2.09795 15.83 2.13995 15.794 2.17595Z" fill="currentColor"></path>
                                      </svg>
                                    </span>
                                    Care: Clean with soft cloth and glass cleaner
                                  </li>

                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Reviews Tab */}
                          {activeTab === 'reviews' && (
                            <div className="tab-para tab-pane fade show active">
                              <div className="text-center py-5">
                                <h4>Customer Reviews</h4>
                                <p className="mb-30">No reviews yet. Be the first to review this product!</p>
                                <button className="tp-btn-theme" style={{ padding: '12px 30px' }}>
                                  Write a Review
                                </button>
                              </div>
                            </div>
                          )}

                          {/* FAQ Tab */}
                          {activeTab === 'faq' && (
                            <div className="tab-para tab-pane fade show active">
                              <div className="tp-custom-accordion">
                                <div className="accordion" id="productFaqAccordion">
                                  {productFaqs.length > 0 ? (
                                    productFaqs.map((faq: any, index: number) => (
                                      <div key={faq.id} className={`accordion-items ${index === 0 ? 'tp-faq-active' : ''}`}>
                                        <h2 className="accordion-header">
                                          <button
                                            className={`accordion-buttons ${index === 0 ? '' : 'collapsed'}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#faq${faq.id}`}
                                            aria-expanded={index === 0 ? "true" : "false"}
                                            aria-controls={`faq${faq.id}`}
                                          >
                                            <span>{index + 1}.</span> {faq.question}
                                          </button>
                                        </h2>
                                        <div
                                          id={`faq${faq.id}`}
                                          className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                        >
                                          <div className="accordion-body">
                                            {faq.answer}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4">
                                      <p>No FAQs available for this product.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
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

          {/* Related Products */}
          <OurProductArea currentProductId={productId || ''} />
        </div>
      </div>
    </>
  );
};

export default ShopDetailsArea;