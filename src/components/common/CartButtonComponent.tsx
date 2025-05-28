'use client';

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import ShoppingCart from './ShoppingCart';
import { HiShoppingCart } from 'react-icons/hi';

interface CartButtonComponentProps {
  variant: 'navbar' | 'floating';
  showDropdown?: boolean;
  iconColor?: string;
  backgroundColor?: string;
}

const CartButtonComponent: React.FC<CartButtonComponentProps> = ({
  variant,
  showDropdown = true,
  iconColor = 'currentColor',
  backgroundColor = 'transparent'
}) => {
  // Get cart data from Redux
  const cartItems = useSelector((state: any) => state.cart.cart);
  const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Styles based on variant
  const getButtonStyles = () => {
    if (variant === 'navbar') {
      return {
        button: 'cart-icon p-relative',
        icon: 'shopping-cart',
        countBadge: 'cart-count'
      };
    } else {
      return {
        button: 'floating-cart-button',
        icon: 'shopping-cart',
        countBadge: 'floating-cart-count'
      };
    }
  };

  const styles = getButtonStyles();
  const targetUrl = '/cart'; // Both variants should go to cart page

  return (
    <div className={`tp-header-icon cart ${variant === 'floating' ? 'floating-cart-container' : 'd-none d-xl-block'}`}>
      <Link
        className={styles.button}
        href={targetUrl}
        style={{
          backgroundColor: variant === 'floating' ? backgroundColor : 'transparent',
          color: iconColor
        }}
      >
        <HiShoppingCart style={{ color: iconColor, fontSize: '20px' }} />
        {itemCount > 0 && (
          <span className={styles.countBadge}>{itemCount}</span>
        )}
      </Link>

      {showDropdown && variant === 'navbar' && <ShoppingCart />}
    </div>
  );
};

export default CartButtonComponent;
