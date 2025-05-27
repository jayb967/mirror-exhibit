'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: any;
  className?: string;
  pauseCarousel?: () => void;
  resumeCarousel?: () => void;
}

const ProductCard = React.memo(({ product, className = '', pauseCarousel, resumeCarousel }: ProductCardProps) => {
  const { openModal: openGlobalModal } = useGlobalModal();
  const [defaultOptions, setDefaultOptions] = useState<{
    sizes: Array<{id: string, name: string, price_adjustment?: number}>,
    frameTypes: Array<{id: string, name: string, price_adjustment?: number}>
  }>({
    sizes: [],
    frameTypes: []
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get the image URL with fallback
  const imageUrl = product?.image || product?.image_url || '/assets/img/logo/ME_Logo.png';

  // Fetch default options with retry mechanism and caching
  useEffect(() => {
    const fetchDefaultOptions = async () => {
      try {
        setIsLoadingOptions(true);

        // Check if options are already cached in sessionStorage
        const cachedOptions = sessionStorage.getItem('productOptions');
        if (cachedOptions) {
          const parsed = JSON.parse(cachedOptions);
          setDefaultOptions({
            sizes: parsed.sizes || [],
            frameTypes: parsed.frameTypes || []
          });
          setIsLoadingOptions(false);
          return;
        }

        // Fetch from API with retry
        let retries = 3;
        let response;

        while (retries > 0) {
          try {
            response = await fetch('/api/product-options');
            if (response.ok) break;
          } catch (err) {
            console.warn(`ProductCard: API call failed, ${retries - 1} retries left`);
          }
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
          }
        }

        if (response && response.ok) {
          const data = await response.json();
          if (data.success) {
            const options = {
              sizes: data.sizes.map(size => ({
                id: size.id,
                name: size.name,
                price_adjustment: size.price_adjustment
              })),
              frameTypes: data.frameTypes.map(frame => ({
                id: frame.id,
                name: frame.name,
                price_adjustment: frame.price_adjustment
              }))
            };

            setDefaultOptions(options);
            // Cache the options for other components
            sessionStorage.setItem('productOptions', JSON.stringify(options));
          }
        }
      } catch (error) {
        console.error('ProductCard: Error fetching default options:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchDefaultOptions();
  }, []);

  // Extract frame types and sizes from product variations
  const frameTypes = React.useMemo(() => {
    // If product has variations, use those
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      return [...new Set(product.variations.map(v =>
        v.frame_type?.id && v.frame_type?.name ?
        JSON.stringify({
          id: v.frame_type.id,
          name: v.frame_type.name,
          price_adjustment: v.frame_type.price_adjustment
        }) : null
      ))]
      .filter(Boolean)
      .map(item => JSON.parse(item));
    }

    // Otherwise use default options
    return defaultOptions.frameTypes;
  }, [product.variations, defaultOptions.frameTypes]);

  const sizes = React.useMemo(() => {
    // If product has variations, use those
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      return [...new Set(product.variations.map(v =>
        v.size?.id && v.size?.name ?
        JSON.stringify({
          id: v.size.id,
          name: v.size.name,
          price_adjustment: v.size.price_adjustment
        }) : null
      ))]
      .filter(Boolean)
      .map(item => JSON.parse(item));
    }

    // Otherwise use default options
    return defaultOptions.sizes;
  }, [product.variations, defaultOptions.sizes]);

  const handleOpenModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Open the global modal with product data
    openGlobalModal({
      product,
      frameTypes: frameTypes,
      sizes: sizes,
      pauseCarousel,
      resumeCarousel
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on the "Add to Cart" button
    if (!(e.target as HTMLElement).closest('.product-add-to-cart-btn')) {
      window.location.href = `/product/${product._id || product.id}`;
    }
  };

  return (
    <>
      <div
        className={`tp-product-2-item ${className}`}
        style={{ height: '470px', marginBottom: '55px' }}
        onClick={handleCardClick}
      >
        <div className="tp-product-2-thumb-box p-relative">
          <div className="tp-product-2-thumb fix p-relative">
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <Image
                src={imageError ? '/assets/img/logo/ME_Logo.png' : imageUrl}
                alt={product?.title || product?.name || 'Product Image'}
                fill={true}
                priority={product?.priority === true}
                loading={product?.priority === true ? "eager" : "lazy"}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: 0
                }}
                onError={(e) => {
                  setImageError(true);
                }}
                unoptimized={true} // Disable optimization to fix WebGL image loading issues
              />
            </div>
            <div className="tp-product-2-button-box">
              <div className="tp-btn-black-lg">
                <span>VIEW DETAILS</span>
              </div>
            </div>
          </div>
        </div>
        <div className="tp-product-2-content d-flex flex-column">
          <h4 className="tp-product-2-title mb-2">
            {product.title || product.name}
          </h4>
          {/* <div className="tp-product-2-rate-2">
            <span>${product.base_price || product.price}</span>
          </div> */}
        </div>
        <button
          className="product-add-to-cart-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenModal(e);
          }}
        >
          ADD TO CART
        </button>
      </div>
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
