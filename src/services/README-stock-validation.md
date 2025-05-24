# Cart Stock Validation Implementation

This document describes the cart stock validation implementation for the Mirror Exhibit e-commerce application.

## Overview

The cart stock validation implementation ensures that users cannot add more items to their cart than are available in stock. It also validates the cart before checkout to prevent orders for out-of-stock items. The implementation works as follows:

1. When a user adds an item to their cart, the system checks if there's enough stock
2. When a user updates the quantity of an item in their cart, the system checks if there's enough stock
3. Before checkout, the system validates all items in the cart against current stock levels
4. If any items are out of stock or have insufficient stock, the user is notified and given options to adjust quantities or remove items

## Components

### 1. Stock Service (`src/services/stockService.ts`)

The core service that handles all stock validation operations:

- `checkProductStock()`: Checks if a product has enough stock for a requested quantity
- `checkCartItemStock()`: Checks if a cart item has enough stock, considering current quantity and additional quantity
- `validateCart()`: Validates all items in a cart against current stock levels
- `updateProductStock()`: Updates a product's stock quantity (used after order completion)

### 2. Cart Service Integration

The cart service has been enhanced to use the stock service for validation:

- `addToCart()`: Checks stock before adding an item to the cart
- `updateQuantity()`: Checks stock before updating an item's quantity, adjusts to maximum available if necessary

### 3. Cart Validation Component

A React component that validates the cart before checkout:

- Validates all cart items against current stock levels
- Shows warnings for items with insufficient stock
- Provides options to update quantities or remove items
- Prevents checkout until all issues are resolved

## Usage

### Adding Items to Cart

When a user adds an item to their cart, the system checks if there's enough stock:

```typescript
// In cartService.ts
async addToCart(productId: string, quantity: number = 1): Promise<CartItem[]> {
  try {
    // Get product details
    const { data: product } = await this.supabase
      .from('products')
      .select('id, name, price, image_url, stock_quantity')
      .eq('id', productId)
      .single();

    // Check if the current cart already has this product
    const currentCart = await this.getCart();
    const existingItem = currentCart.find(item => item.product_id === productId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    // Validate stock with the stock service
    const { hasStock, availableStock, errorMessage } = await stockService.checkCartItemStock(
      productId,
      currentQuantity,
      quantity
    );

    if (!hasStock) {
      toast.error(errorMessage || `Only ${availableStock} items available`);
      return this.getCart();
    }

    // Add to cart...
  }
}
```

### Updating Cart Item Quantity

When a user updates the quantity of an item in their cart, the system checks if there's enough stock:

```typescript
// In cartService.ts
async updateQuantity(productId: string, quantity: number): Promise<CartItem[]> {
  try {
    // Validate stock with the stock service
    const { hasStock, availableStock, allowedQuantity, errorMessage } = await stockService.checkCartItemStock(
      productId,
      0,
      quantity
    );
    
    if (!hasStock) {
      toast.warning(errorMessage || `Only ${availableStock} items available`);
      
      // If there's some stock available, update to the maximum available quantity
      if (availableStock > 0) {
        quantity = allowedQuantity;
        toast.info(`Quantity adjusted to ${quantity}`);
      } else {
        return this.getCart();
      }
    }

    // Update quantity...
  }
}
```

### Validating Cart Before Checkout

Before checkout, the system validates all items in the cart against current stock levels:

```tsx
// In CartValidation.tsx
const validateCartItems = async () => {
  // Prepare cart items for validation
  const itemsToValidate = cartItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }));
  
  // Validate cart with stock service
  const { isValid, invalidItems, errorMessage } = await stockService.validateCart(itemsToValidate);
  
  // If cart is valid, proceed
  if (isValid) {
    onValidationComplete(true);
  } else {
    // Handle invalid items...
    onValidationComplete(false);
  }
};
```

## Security Considerations

- Stock validation is performed on both the client and server sides
- Server-side validation is the source of truth to prevent client-side manipulation
- Database transactions ensure that stock updates are atomic and consistent

## Future Improvements

- Add real-time stock updates using WebSockets
- Implement temporary stock reservation during checkout
- Add low stock notifications for users
- Implement backorder functionality for out-of-stock items
- Add stock threshold settings for admin configuration
