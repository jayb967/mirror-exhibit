'use client';

import { useState, useEffect } from 'react';
import { cartService, CartItem } from '@/services/cartService';

/**
 * Custom hook for using the cart service
 * Provides cart data and operations with loading state
 */
export function useCartService() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Calculate cart totals
  const calculateTotals = (items: CartItem[]) => {
    const itemSubtotal = items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
    
    const taxAmount = itemSubtotal * 0.1; // 10% tax rate
    const orderTotal = itemSubtotal + taxAmount;
    
    setSubtotal(itemSubtotal);
    setTax(taxAmount);
    setTotal(orderTotal);
    
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    setItemCount(count);
  };

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setLoading(true);
      const items = await cartService.getCart();
      setCartItems(items);
      calculateTotals(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId: string, quantity: number = 1) => {
    const updatedCart = await cartService.addToCart(productId, quantity);
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
    return updatedCart;
  };

  // Update item quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    const updatedCart = await cartService.updateQuantity(productId, quantity);
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
    return updatedCart;
  };

  // Remove item from cart
  const removeFromCart = async (productId: string) => {
    const updatedCart = await cartService.removeFromCart(productId);
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
    return updatedCart;
  };

  // Clear cart
  const clearCart = async () => {
    const updatedCart = await cartService.clearCart();
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
    return updatedCart;
  };

  // Initial cart fetch
  useEffect(() => {
    fetchCart();
  }, []);

  return {
    cartItems,
    loading,
    subtotal,
    tax,
    total,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };
}
