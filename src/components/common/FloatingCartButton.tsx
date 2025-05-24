'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import CartButtonComponent from './CartButtonComponent';

const FloatingCartButton: React.FC = () => {
  // Get cart data from Redux
  const cartItems = useSelector((state: any) => state.cart.cart);
  const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Check if we're on cart or checkout pages
  const isCartOrCheckoutPage = pathname === '/cart' || pathname.startsWith('/checkout');

  // Show the floating button when there are items in the cart
  useEffect(() => {
    // Don't show on cart or checkout pages
    if (isCartOrCheckoutPage) {
      setIsVisible(false);
      return;
    }

    // Initial check - show button if there are items in cart
    if (itemCount > 0) {
      setIsVisible(true);
    }
  }, [itemCount, isCartOrCheckoutPage]);

  // Also check when itemCount changes
  useEffect(() => {
    // Don't show on cart or checkout pages
    if (isCartOrCheckoutPage) {
      setIsVisible(false);
      return;
    }

    if (itemCount === 0) {
      setIsVisible(false);
    } else {
      // Always show the button when there are items in the cart
      setIsVisible(true);
    }
  }, [itemCount, isCartOrCheckoutPage]);

  if (!isVisible) return null;

  return (
    <CartButtonComponent
      variant="floating"
      showDropdown={false}
      backgroundColor="#000000"
      iconColor="#ffffff"
    />
  );
};

export default FloatingCartButton;
