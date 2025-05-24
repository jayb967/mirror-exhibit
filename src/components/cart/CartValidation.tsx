'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { stockService } from '@/services/stockService';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { decrease_quantity, remove_cart_product } from '@/redux/features/cartSlice';

interface CartValidationProps {
  onValidationComplete: (isValid: boolean) => void;
  children: React.ReactNode;
}

/**
 * Cart validation component
 * Validates cart items against stock levels before proceeding
 */
const CartValidation: React.FC<CartValidationProps> = ({ onValidationComplete, children }) => {
  // Redux cart data
  const cartItems = useSelector((state: any) => state.cart.cart);
  const dispatch = useDispatch();

  const [validating, setValidating] = useState(true);
  const [invalidItems, setInvalidItems] = useState<Array<{
    product_id: string;
    requestedQuantity: number;
    availableStock: number;
    productName?: string;
  }>>([]);

  // Validate cart when component mounts or cart items change
  useEffect(() => {
    const validateCartItems = async () => {
      setValidating(true);

      try {
        // Skip validation if cart is empty
        if (cartItems.length === 0) {
          onValidationComplete(true);
          setValidating(false);
          return;
        }

        // Prepare cart items for validation
        const itemsToValidate = cartItems.map((item: any) => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity
        }));

        // Validate cart with stock service
        const { isValid, invalidItems, errorMessage } = await stockService.validateCart(itemsToValidate);

        // If cart is valid, proceed
        if (isValid) {
          onValidationComplete(true);
          setInvalidItems([]);
        } else {
          // Enhance invalid items with product names
          const enhancedInvalidItems = invalidItems.map(item => {
            const cartItem = cartItems.find((ci: any) => (ci.product_id || ci.id) === item.product_id);
            return {
              ...item,
              productName: cartItem?.title || 'Product'
            };
          });

          setInvalidItems(enhancedInvalidItems);
          onValidationComplete(false);

          if (errorMessage) {
            toast.error(errorMessage);
          }
        }
      } catch (error) {
        console.error('Error validating cart:', error);
        toast.error('Failed to validate cart items');
        onValidationComplete(false);
      } finally {
        setValidating(false);
      }
    };

    validateCartItems();
  }, [cartItems, onValidationComplete]);

  // Handle updating item quantity to available stock
  const handleUpdateQuantity = (productId: string, availableStock: number) => {
    if (availableStock <= 0) {
      // Find the cart item to remove
      const cartItem = cartItems.find((item: any) => (item.product_id || item.id) === productId);
      if (cartItem) {
        dispatch(remove_cart_product(cartItem));
        toast.info('Item removed from cart due to unavailability');
      }
    } else {
      // For updating quantity, we need to find the item and adjust it
      const cartItem = cartItems.find((item: any) => (item.product_id || item.id) === productId);
      if (cartItem) {
        // Calculate how many times to decrease quantity
        const currentQuantity = cartItem.quantity;
        const decreaseAmount = currentQuantity - availableStock;

        // Decrease quantity by the difference
        for (let i = 0; i < decreaseAmount; i++) {
          dispatch(decrease_quantity(cartItem));
        }
        toast.info(`Quantity adjusted to ${availableStock}`);
      }
    }
  };

  // Handle removing item from cart
  const handleRemoveItem = (productId: string) => {
    const cartItem = cartItems.find((item: any) => (item.product_id || item.id) === productId);
    if (cartItem) {
      dispatch(remove_cart_product(cartItem));
      toast.info('Item removed from cart');
    }
  };

  // If validating, show loading state
  if (validating) {
    return (
      <div className="tw-flex tw-justify-center tw-items-center tw-py-8">
        <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-t-2 tw-border-b-2 tw-border-blue-500"></div>
        <span className="tw-ml-2">Validating cart items...</span>
      </div>
    );
  }

  // If there are invalid items, show warning and options
  if (invalidItems.length > 0) {
    return (
      <div className="tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-lg tw-p-4 tw-mb-6">
        <h3 className="tw-text-lg tw-font-medium tw-text-yellow-800 tw-mb-2">
          Some items in your cart are no longer available in the requested quantity
        </h3>
        <p className="tw-text-yellow-700 tw-mb-4">
          Please review the following items and update your cart before proceeding:
        </p>

        <ul className="tw-space-y-3 tw-mb-4">
          {invalidItems.map(item => (
            <li key={item.product_id} className="tw-flex tw-justify-between tw-items-center tw-border-b tw-border-yellow-200 tw-pb-2">
              <div>
                <span className="tw-font-medium">{item.productName}</span>
                <p className="tw-text-sm tw-text-yellow-700">
                  Requested: {item.requestedQuantity}, Available: {item.availableStock}
                </p>
              </div>
              <div className="tw-space-x-2">
                {item.availableStock > 0 && (
                  <button
                    onClick={() => handleUpdateQuantity(item.product_id, item.availableStock)}
                    className="tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-px-3 tw-py-1 tw-rounded tw-text-sm"
                  >
                    Update Quantity
                  </button>
                )}
                <button
                  onClick={() => handleRemoveItem(item.product_id)}
                  className="tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-px-3 tw-py-1 tw-rounded tw-text-sm"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="tw-flex tw-justify-between tw-items-center">
          <Link href="/cart" className="tw-text-blue-600 hover:tw-text-blue-800">
            Return to Cart
          </Link>
          <button
            onClick={() => {
              // Update all items to their available stock
              Promise.all(
                invalidItems.map(item =>
                  handleUpdateQuantity(item.product_id, item.availableStock)
                )
              );
            }}
            className="tw-bg-yellow-600 hover:tw-bg-yellow-700 tw-text-white tw-px-4 tw-py-2 tw-rounded"
          >
            Update All Items
          </button>
        </div>
      </div>
    );
  }

  // If cart is valid, render children
  return <>{children}</>;
};

export default CartValidation;
