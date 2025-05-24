# Services Implementation

This document describes the service implementations for the Mirror Exhibit e-commerce application.

## Overview

The services folder contains various service modules that provide business logic and data access functionality for the application. Services abstract complex operations and provide a clean API for components to interact with data sources and external APIs.

## Components

### 1. Cart Service (`src/services/cartService.ts`)

The core service that handles all cart operations:

- `getCart()`: Retrieves cart items from Supabase (for authenticated users) or local storage (for guests)
- `addToCart()`: Adds an item to the cart
- `updateQuantity()`: Updates the quantity of an item in the cart
- `removeFromCart()`: Removes an item from the cart
- `clearCart()`: Clears the entire cart
- `syncCartAfterLogin()`: Synchronizes local cart with database after login

### 2. Cart Context (`src/contexts/CartContext.tsx`)

A React context that provides cart functionality throughout the application:

- Manages cart state (items, totals, loading state)
- Provides cart operations to components
- Handles cart synchronization on login/logout
- Listens for real-time updates to cart data in Supabase

### 3. Cart Hook (`src/hooks/useCartService.ts`)

A custom hook for using the cart service directly:

- Provides cart data and operations with loading state
- Calculates cart totals (subtotal, tax, total)
- Manages cart item count

### 4. Cart Components

- `CartPage.tsx`: The main cart page component
- `AddToCartButton.tsx`: A reusable button for adding products to cart
- `ShoppingCart.tsx`: The mini cart component shown in the header
- `CartButton.tsx`: The cart icon button in the header

## Database Schema

The cart data is stored in the `cart_items` table in Supabase:

```sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
```

## Database Functions

The following Supabase functions are used for cart operations:

### 1. `add_to_cart`

Adds an item to the cart or updates the quantity if it already exists:

```sql
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF cart_items AS $$
BEGIN
  RETURN QUERY
  INSERT INTO cart_items (user_id, product_id, quantity)
  VALUES (p_user_id, p_product_id, p_quantity)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET
    quantity = cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. `update_cart_quantity`

Updates the quantity of an item in the cart:

```sql
CREATE OR REPLACE FUNCTION update_cart_quantity(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF cart_items AS $$
BEGIN
  IF p_quantity <= 0 THEN
    -- Remove item from cart if quantity is 0 or negative
    DELETE FROM cart_items
    WHERE user_id = p_user_id AND product_id = p_product_id;

    -- Return empty set
    RETURN;
  ELSE
    -- Update quantity
    RETURN QUERY
    UPDATE cart_items
    SET
      quantity = p_quantity,
      updated_at = now()
    WHERE
      user_id = p_user_id AND
      product_id = p_product_id
    RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. `get_cart_with_products`

Retrieves cart items with product details:

```sql
CREATE OR REPLACE FUNCTION get_cart_with_products(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  product_id UUID,
  quantity INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product_name TEXT,
  product_price DECIMAL(10,2),
  product_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.user_id,
    c.product_id,
    c.quantity,
    c.created_at,
    c.updated_at,
    p.name,
    p.price,
    p.image_url
  FROM
    cart_items c
  JOIN
    products p ON c.product_id = p.id
  WHERE
    c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Product Import Service (`src/services/productImportService.ts`)

A service for importing products from Shopify CSV export format:

- `processProducts(products, onProgress)`: Process a batch of products from CSV
- `groupProductsByHandle(products)`: Group product rows by handle
- `processProductGroup(handle, productRows)`: Process a group of product rows with the same handle
- `findProductByHandle(handle)`: Find a product by its handle
- `createProduct(productRow, categoryId)`: Create a new product
- `updateProduct(productId, productRow, categoryId)`: Update an existing product
- `getOrCreateCategory(categoryName)`: Get or create a category
- `getOrCreateBrand(brandName)`: Get or create a brand
- `processVariations(productId, productRows)`: Process product variations
- `processImages(productId, productRows)`: Process product images

### 5. Product Compatibility Service (`src/services/productCompatibilityService.ts`)

A service that ensures compatibility between imported products and existing product functionality:

- `normalizeProductData(product)`: Normalize product data to ensure compatibility
- `getProductById(productId)`: Get product by ID with all related data
- `getProducts(options)`: Get products with pagination and filtering
- `updateProduct(productId, productData)`: Update product data
- `updateProductVariations(productId, variations)`: Update product variations
- `updateProductImages(productId, images)`: Update product images

## 🔄 Recent Changes

| Date       | Change Description                                                 | Reason                                                |
|------------|-------------------------------------------------------------------|-------------------------------------------------------|
| 2024-06-01 | Added productCompatibilityService.ts                               | Ensure compatibility between imported and existing products |
| 2024-06-01 | Updated productImportService.ts to use compatibility service       | Prevent conflicts with existing product functionality |
| 2024-06-01 | Added comprehensive error handling to import process               | Improve reliability of product imports |
| 2024-06-01 | Implemented batch processing for image uploads                     | Prevent overwhelming server with many simultaneous uploads |
| 2024-06-01 | Added support for creating categories and brands if they don't exist | Simplify import process for admins |

## Usage

### Cart Usage

#### Adding to Cart

```tsx
import { useCart } from '@/contexts/CartContext';

function ProductComponent({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}
```

#### Using the AddToCartButton Component

```tsx
import AddToCartButton from '@/components/common/AddToCartButton';

function ProductComponent({ product }) {
  return (
    <AddToCartButton
      productId={product.id}
      showQuantity={true}
      buttonText="Add to Cart"
    />
  );
}
```

#### Displaying Cart Items

```tsx
import { useCart } from '@/contexts/CartContext';

function CartComponent() {
  const { cartItems, subtotal, tax, total } = useCart();

  return (
    <div>
      <h2>Your Cart</h2>
      {cartItems.map(item => (
        <div key={item.id}>
          <p>{item.product.name}</p>
          <p>Quantity: {item.quantity}</p>
          <p>Price: ${item.product.price}</p>
        </div>
      ))}
      <div>
        <p>Subtotal: ${subtotal}</p>
        <p>Tax: ${tax}</p>
        <p>Total: ${total}</p>
      </div>
    </div>
  );
}
```

### Product Import Usage

```tsx
import { productImportService } from '@/services/productImportService';

// Process products from CSV
const stats = await productImportService.processProducts(
  csvProducts,
  (progress, currentStats) => {
    // Update UI with progress
    setProgress(progress);
    setStats(currentStats);
  }
);
```

### Product Compatibility Usage

```tsx
import { productCompatibilityService } from '@/services/productCompatibilityService';

// Get products with pagination and filtering
const { data, count } = await productCompatibilityService.getProducts({
  page: 1,
  limit: 10,
  category_id: 'some-category-id',
  search: 'search term',
  sort_by: 'created_at',
  sort_order: 'desc',
  is_active: true
});

// Get product by ID
const product = await productCompatibilityService.getProductById('product-id');

// Update product
await productCompatibilityService.updateProduct('product-id', {
  name: 'Updated Product Name',
  description: 'Updated description',
  price: 99.99,
  // Other product data...
});
```
