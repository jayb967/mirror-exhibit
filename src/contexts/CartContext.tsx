'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartService, CartItem, Product } from '@/services/cartService';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  addToCart: (productId: string, quantity?: number, variationData?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  const supabase = createClientComponentClient();

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

    // Update cart count badge in the header
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
          element.textContent = count > 0 ? count.toString() : '';
        });
      }, 0);
    }
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
  const addToCart = async (productId: string, quantity: number = 1, variationData?: any) => {
    const updatedCart = await cartService.addToCart(productId, quantity, variationData);
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    const updatedCart = await cartService.updateQuantity(itemId, quantity);
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    const updatedCart = await cartService.removeFromCart(itemId);
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
  };

  // Clear cart
  const clearCart = async () => {
    const updatedCart = await cartService.clearCart();
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
  };

  // Sync cart after login
  const syncCartAfterLogin = async () => {
    const updatedCart = await cartService.syncCartAfterLogin();
    setCartItems(updatedCart);
    calculateTotals(updatedCart);
  };

  // Initial cart fetch
  useEffect(() => {
    fetchCart();
  }, []);

  // Update cart count badge when component mounts and when itemCount changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
        element.textContent = itemCount > 0 ? itemCount.toString() : '';
      });
    }
  }, [itemCount]);

  // Listen for auth state changes to sync cart
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        syncCartAfterLogin();
      } else if (event === 'SIGNED_OUT') {
        fetchCart();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Listen for cart changes in Supabase
  useEffect(() => {
    const setupCartSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const subscription = supabase
          .channel('cart-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cart_items',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              fetchCart();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      }
    };

    const unsubscribe = setupCartSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe.then(unsub => unsub && unsub());
      }
    };
  }, [supabase]);

  const value = {
    cartItems,
    loading,
    subtotal,
    tax,
    total,
    itemCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
