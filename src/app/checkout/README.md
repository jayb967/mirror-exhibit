# Guest Checkout Implementation

This document describes the guest checkout implementation for the Mirror Exhibit e-commerce application.

## Overview

The guest checkout implementation allows users to complete purchases without creating an account. It works as follows:

1. Users can add products to their cart without being logged in
2. When they proceed to checkout, they can choose to sign in or continue as a guest
3. Guest users provide their information, which is stored in the database with a unique guest token
4. Orders are associated with the guest token instead of a user ID
5. If a guest user later creates an account, their orders and cart can be transferred to their account

## Components

### 1. Database Schema

The implementation uses the following database tables:

- `guest_users`: Stores guest user information
- `guest_cart_items`: Stores cart items for guest users
- `orders`: Modified to support both user_id and guest_token

### 2. Cart Service

The cart service has been enhanced to support guest users:

- Uses local storage for temporary storage
- Creates a guest token for identifying guest users
- Synchronizes cart data with the database for both authenticated and guest users
- Provides methods for converting guest users to registered users

### 3. Checkout Flow

The checkout flow has been updated to support guest users:

- Allows users to choose between signing in or continuing as a guest
- Collects guest information and stores it in the database
- Creates orders associated with the guest token
- Processes payments through Stripe for both authenticated and guest users

### 4. API Routes

The API routes have been updated to support guest users:

- `/api/create-checkout-session`: Supports creating checkout sessions for both authenticated and guest users
- Validates orders based on either user ID or guest token

## Database Functions

The implementation uses the following database functions:

### 1. `add_to_guest_cart`

Adds an item to a guest user's cart:

```sql
CREATE OR REPLACE FUNCTION add_to_guest_cart(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF guest_cart_items AS $$
BEGIN
  RETURN QUERY
  INSERT INTO guest_cart_items (guest_token, product_id, quantity)
  VALUES (p_guest_token, p_product_id, p_quantity)
  ON CONFLICT (guest_token, product_id)
  DO UPDATE SET
    quantity = guest_cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. `update_guest_cart_quantity`

Updates the quantity of an item in a guest user's cart:

```sql
CREATE OR REPLACE FUNCTION update_guest_cart_quantity(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF guest_cart_items AS $$
BEGIN
  IF p_quantity <= 0 THEN
    -- Remove item from cart if quantity is 0 or negative
    DELETE FROM guest_cart_items
    WHERE guest_token = p_guest_token AND product_id = p_product_id;

    -- Return empty set
    RETURN;
  ELSE
    -- Update quantity
    RETURN QUERY
    UPDATE guest_cart_items
    SET
      quantity = p_quantity,
      updated_at = now()
    WHERE
      guest_token = p_guest_token AND
      product_id = p_product_id
    RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. `convert_guest_to_user`

Converts a guest user to a registered user:

```sql
CREATE OR REPLACE FUNCTION convert_guest_to_user(
  p_guest_token TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_guest_cart_item RECORD;
BEGIN
  -- Transfer cart items from guest to user
  FOR v_guest_cart_item IN
    SELECT product_id, quantity FROM guest_cart_items WHERE guest_token = p_guest_token
  LOOP
    -- Add to user's cart using existing function
    PERFORM add_to_cart(p_user_id, v_guest_cart_item.product_id, v_guest_cart_item.quantity);
  END LOOP;

  -- Update any orders associated with this guest
  UPDATE orders
  SET
    user_id = p_user_id,
    guest_token = NULL
  WHERE guest_token = p_guest_token;

  -- Delete guest cart items
  DELETE FROM guest_cart_items WHERE guest_token = p_guest_token;

  -- Delete guest user
  DELETE FROM guest_users WHERE guest_token = p_guest_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Usage

### Guest Checkout Flow

1. User adds products to cart
2. User proceeds to checkout
3. User chooses to continue as guest
4. User fills out guest information form
5. User completes checkout process
6. Order is created with guest token
7. Payment is processed through Stripe

### Converting Guest to User

If a guest user later creates an account, their orders and cart can be transferred to their account:

```typescript
// After user signs up or logs in
const userId = 'user-id-from-auth';
const success = await cartService.convertGuestToUser(userId);
if (success) {
  // Guest data has been transferred to user account
}
```

## Security Considerations

- Guest tokens are stored in local storage and in the database
- Guest users can only access their own data
- Row-level security policies ensure that guest users cannot access other users' data
- Guest data is automatically transferred to user accounts when users sign up or log in

## New Implementations

### 1. Order Tracking for Guest Users

Guest users can now track their orders using their email and order ID:

- `/order/track` - Page for entering email and order ID to track an order
- `/order/[id]` - Order details page that supports both authenticated and guest users
- `/api/guest/orders` - API route for retrieving guest orders

### 2. Account Creation After Checkout

Guest users can now create an account after checkout:

- `CreateAccountBanner` component on the order success page
- Automatic transfer of guest data to the new account
- Seamless transition from guest to registered user

### 3. Guest Data Cleanup

Implemented automatic and manual cleanup of old guest user data:

- `cleanup_old_guest_data` database function to remove old guest data
- Scheduled cleanup using pg_cron (runs daily at 3:00 AM)
- Admin maintenance page for manual cleanup

## Future Improvements

- Add email verification for guest users
- Enhance order tracking with shipping status updates
- Implement abandoned cart recovery emails for guest users
- Add social login options during guest checkout
- Implement guest user analytics to track conversion rates
