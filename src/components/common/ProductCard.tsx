'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductOptionsModal from './ProductOptionsModal';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: any;
  className?: string;
  pauseCarousel?: () => void;
  resumeCarousel?: () => void;
}

const ProductCard = ({ product, className = '', pauseCarousel, resumeCarousel }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultOptions, setDefaultOptions] = useState<{
    sizes: Array<{id: string, name: string}>,
    frameTypes: Array<{id: string, name: string}>
  }>({
    sizes: [],
    frameTypes: []
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Fetch default options if needed
  useEffect(() => {
    const fetchDefaultOptions = async () => {
      try {
        setIsLoadingOptions(true);
        const response = await fetch('/api/product-options');
        const data = await response.json();

        if (data.success) {
          setDefaultOptions({
            sizes: data.sizes.map(size => ({ id: size.id, name: size.name })),
            frameTypes: data.frameTypes.map(frame => ({ id: frame.id, name: frame.name }))
          });
        }
      } catch (error) {
        console.error('Error fetching default options:', error);
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
        JSON.stringify({id: v.frame_type.id, name: v.frame_type.name}) : null
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
        JSON.stringify({id: v.size.id, name: v.size.name}) : null
      ))]
      .filter(Boolean)
      .map(item => JSON.parse(item));
    }

    // Otherwise use default options
    return defaultOptions.sizes;
  }, [product.variations, defaultOptions.sizes]);

  const openModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);

    // Ensure the carousel is resumed after the modal is closed
    if (resumeCarousel) {
      // Add a small delay to ensure the modal is fully closed
      setTimeout(() => {
        resumeCarousel();
      }, 300);
    }
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
                src={product.image || product.image_url || '/assets/img/logo/ME_Logo.png'}
                alt={product.title || product.name}
                fill={true}
                priority={product.priority === true}
                loading={product.priority === true ? "eager" : "lazy"}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg=="
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: 0
                }}
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
          <div className="tp-product-2-rate-2">
            <span>${product.base_price || product.price}</span>
            {product.variations && product.variations.length > 0 && (
              <small className="ml-2">({product.variations.length} variations)</small>
            )}
          </div>
        </div>
        <button
          className="product-add-to-cart-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal(e);
          }}
        >
          ADD TO CART
        </button>
      </div>

      <ProductOptionsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={product}
        frameTypes={frameTypes}
        sizes={sizes}
        pauseCarousel={pauseCarousel}
        resumeCarousel={resumeCarousel}
      />
    </>
  );
};

export default ProductCard;
