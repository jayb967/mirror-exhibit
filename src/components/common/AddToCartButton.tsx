'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

interface AddToCartButtonProps {
  productId: string;
  className?: string;
  width?: string;
  showQuantity?: boolean;
  buttonText?: string;
  onAddedToCart?: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  className = '',
  width,
  showQuantity = false,
  buttonText = 'Add to Cart',
  onAddedToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await addToCart(productId, quantity);
      if (onAddedToCart) {
        onAddedToCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`tw-flex tw-flex-col ${className}`}>
      {showQuantity && (
        <div className="tw-flex tw-items-center tw-mb-4">
          <label htmlFor="quantity" className="tw-mr-2 tw-text-gray-700">Quantity:</label>
          <div className="tw-flex tw-items-center tw-border tw-border-gray-300 tw-rounded">
            <button
              type="button"
              onClick={decrementQuantity}
              className="tw-px-3 tw-py-1 tw-bg-gray-100 hover:tw-bg-gray-200 tw-rounded-l"
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="tw-w-12 tw-text-center tw-border-0 tw-focus:ring-0"
            />
            <button
              type="button"
              onClick={incrementQuantity}
              className="tw-px-3 tw-py-1 tw-bg-gray-100 hover:tw-bg-gray-200 tw-rounded-r"
            >
              +
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={loading}
        className={`add-to-cart-btn ${loading ? 'tw-opacity-70 tw-cursor-not-allowed' : ''}`}
        style={width ? { width } : {}}
      >
        {loading ? (
          <span className="tw-flex tw-items-center tw-justify-center">
            <svg className="tw-animate-spin tw-h-5 tw-w-5 tw-mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="tw-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="tw-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </span>
        ) : (
          buttonText
        )}
      </button>
    </div>
  );
};

export default AddToCartButton;
