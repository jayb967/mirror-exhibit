'use client'

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart, addToCartWithAuth } from '@/redux/features/cartSlice';
import { toast } from 'react-toastify';
import { useGlobalModal } from '@/contexts/GlobalModalContext';
import { createPortal } from 'react-dom';

const GlobalProductModal = () => {
  const dispatch = useDispatch();
  const { isModalOpen, modalData, closeModal } = useGlobalModal();
  const [selectedFrame, setSelectedFrame] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts (for portal)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isModalOpen]);

  // Set default selections when modal opens and reset when closed
  useEffect(() => {
    if (isModalOpen && modalData) {
      const { frameTypes, sizes, product } = modalData;

      // Set defaults when modal opens - prioritize "Classic Wood" and "Small"
      if (frameTypes.length > 0) {
        const classicWood = frameTypes.find(frame => frame.name === 'Classic Wood');
        setSelectedFrame(classicWood?.id || frameTypes[0].id);
      }
      if (sizes.length > 0) {
        const smallSize = sizes.find(size => size.name === 'Small');
        setSelectedSize(smallSize?.id || sizes[0].id);
      }
      // Reset quantity
      setQuantity(1);

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure body scroll is restored
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, modalData]);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Find the selected variation based on size and frame
  const selectedVariation = React.useMemo(() => {
    if (!modalData?.product.variations || !Array.isArray(modalData.product.variations)) return null;

    return modalData.product.variations.find(
      v => v.size?.id === selectedSize && v.frame_type?.id === selectedFrame
    );
  }, [modalData?.product.variations, selectedSize, selectedFrame]);

  // Calculate price with adjustments
  const calculatedPrice = React.useMemo(() => {
    if (!modalData) return 0;

    const basePrice = modalData.product.price || modalData.product.base_price || 0;

    // If we have a specific variation, use its price
    if (selectedVariation) {
      return selectedVariation.price;
    }

    // Otherwise calculate from base price + adjustments
    const selectedSizeObj = modalData.sizes.find(s => s.id === selectedSize);
    const selectedFrameObj = modalData.frameTypes.find(f => f.id === selectedFrame);

    const sizeAdjustment = selectedSizeObj?.price_adjustment || 0;
    const frameAdjustment = selectedFrameObj?.price_adjustment || 0;

    return basePrice + sizeAdjustment + frameAdjustment;
  }, [modalData, selectedVariation, selectedSize, selectedFrame]);

  const handleAddToCart = async (e?: React.MouseEvent) => {
    // Prevent any event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!modalData) return;

    const { frameTypes, sizes, product } = modalData;

    if (!selectedFrame && frameTypes.length > 0) {
      toast.error('Please select a frame type');
      return;
    }

    if (!selectedSize && sizes.length > 0) {
      toast.error('Please select a size');
      return;
    }

    // Create cart item using the calculated price
    const cartItem = {
      id: selectedVariation?.id || product.id, // Use variation ID if available
      title: product.title || product.name,
      price: calculatedPrice,
      image: product.image || product.image_url,
      quantity: quantity,
      frame_type: selectedFrame,
      frame_name: frameTypes.find(f => f.id === selectedFrame)?.name || null,
      size: selectedSize,
      size_name: sizes.find(s => s.id === selectedSize)?.name || null,
      variation_id: selectedVariation?.id, // Store variation ID separately
      product_id: product.id // Store original product ID
    };

    // Close modal immediately for instant user feedback
    closeModal();

    // Add to cart with background database sync (non-blocking)
    dispatch(addToCartWithAuth(cartItem) as any);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    closeModal();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Close modal if clicking on the overlay (not the modal content)
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    }
  };

  // Prevent modal content clicks from closing the modal
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Don't render anything if not mounted (SSR safety) or modal is not open
  if (!mounted || !isModalOpen || !modalData) return null;

  const { product, frameTypes, sizes } = modalData;

  // Use portal to render modal at document body level
  return createPortal(
    <div className="global-product-modal-overlay" onClick={handleOverlayClick}>
      <div className="global-product-modal" onClick={handleModalContentClick}>
        <div className="modal-header">
          <h4>Select Options</h4>
          <button className="close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="product-info">
            <h5>{product.title || product.name}</h5>
            <p className="price">${calculatedPrice.toFixed(2)}</p>
            {(selectedSize || selectedFrame) && (
              <p className="variation-details">
                {selectedSize && sizes.find(s => s.id === selectedSize)?.name &&
                  <span>Size: {sizes.find(s => s.id === selectedSize)?.name}</span>}
                {selectedFrame && frameTypes.find(f => f.id === selectedFrame)?.name &&
                  <span>{selectedSize ? ' | ' : ''}Frame: {frameTypes.find(f => f.id === selectedFrame)?.name}</span>}
              </p>
            )}
          </div>

          <div className="product-options">
            {frameTypes.length > 0 && (
              <div className="option-group">
                <label>Frame Type:</label>
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
              </div>
            )}

            {sizes.length > 0 && (
              <div className="option-group">
                <label>Size:</label>
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
              </div>
            )}

            {frameTypes.length === 0 && sizes.length === 0 && (
              <div className="option-group">
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  No customization options available for this product.
                </p>
              </div>
            )}

            <div className="option-group">
              <label>Quantity:</label>
              <div className="tp-shop-details__quantity-box">
                <div className="tp-shop-details__quantity">
                  <div className="tp-cart-minus" onClick={decreaseQuantity}>
                    <i className="fas fa-minus"></i>
                  </div>
                  <input type="text" value={quantity} readOnly />
                  <div className="tp-cart-plus" onClick={increaseQuantity}>
                    <i className="fas fa-plus"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="add-to-cart-btn" onClick={handleAddToCart}>
            Add To Cart
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GlobalProductModal;
