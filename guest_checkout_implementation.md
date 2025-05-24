# Guest Checkout Implementation Guide

This document provides instructions for implementing guest checkout functionality in the Mirror Exhibit e-commerce application.

## Overview

The guest checkout implementation allows users to complete purchases without creating an account. It works as follows:

1. Users can add products to their cart without being logged in
2. When they proceed to checkout, they can choose to sign in or continue as a guest
3. Guest users provide their information, which is stored in the database with a unique guest token
4. Orders are associated with the guest token instead of a user ID
5. If a guest user later creates an account, their orders and cart can be transferred to their account

## Implementation Steps

### 1. Database Setup

Run the SQL scripts to create the necessary database tables and functions:

1. Run `guest_checkout_tables.sql` to create the database tables
2. Run `guest_checkout_functions.sql` to create the database functions

These scripts will create:
- `guest_users` table to store guest user information
- `guest_cart_items` table to store cart items for guest users
- Database functions for managing guest carts and users
- Row-level security policies for data protection

### 2. API Routes

The implementation includes API routes for guest checkout:

- `/api/guest/cart` - Manages guest cart items
- `/api/guest/user` - Manages guest user information
- `/api/create-checkout-session` - Creates Stripe checkout sessions (already supports guest checkout)

### 3. Frontend Components

The implementation includes frontend components for guest checkout:

- `GuestCheckoutForm` - Form for collecting guest user information
- Cart service with guest user support
- Checkout page with guest checkout flow

## Testing the Implementation

After implementing the database tables and functions, you can test the guest checkout flow:

1. Add items to cart without logging in
2. Proceed to checkout
3. Choose "Continue as Guest"
4. Fill in guest information
5. Complete the checkout process
6. Verify that the order is created with the guest token

## Database Schema

### Guest Users Table

```sql
CREATE TABLE IF NOT EXISTS public.guest_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_token TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  apartment TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Guest Cart Items Table

```sql
CREATE TABLE IF NOT EXISTS public.guest_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_token TEXT NOT NULL REFERENCES public.guest_users(guest_token) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (guest_token, product_id)
);
```

### Orders Table Modification

```sql
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS guest_token TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT;
```

## Database Functions

### Add to Guest Cart

```sql
CREATE OR REPLACE FUNCTION public.add_to_guest_cart(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF public.guest_cart_items AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.guest_cart_items (guest_token, product_id, quantity)
  VALUES (p_guest_token, p_product_id, p_quantity)
  ON CONFLICT (guest_token, product_id) 
  DO UPDATE SET 
    quantity = guest_cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Update Guest Cart Quantity

```sql
CREATE OR REPLACE FUNCTION public.update_guest_cart_quantity(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF public.guest_cart_items AS $$
BEGIN
  IF p_quantity <= 0 THEN
    -- Remove item from cart if quantity is 0 or negative
    DELETE FROM public.guest_cart_items 
    WHERE guest_token = p_guest_token AND product_id = p_product_id;
    
    -- Return empty set
    RETURN;
  ELSE
    -- Update quantity
    RETURN QUERY
    UPDATE public.guest_cart_items 
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

### Convert Guest to User

```sql
CREATE OR REPLACE FUNCTION public.convert_guest_to_user(
  p_guest_token TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_guest_cart_item RECORD;
BEGIN
  -- Transfer cart items from guest to user
  FOR v_guest_cart_item IN 
    SELECT product_id, quantity FROM public.guest_cart_items WHERE guest_token = p_guest_token
  LOOP
    -- Add to user's cart using existing function
    PERFORM public.add_to_cart(p_user_id, v_guest_cart_item.product_id, v_guest_cart_item.quantity);
  END LOOP;
  
  -- Update any orders associated with this guest
  UPDATE public.orders
  SET 
    user_id = p_user_id,
    guest_token = NULL
  WHERE guest_token = p_guest_token;
  
  -- Delete guest cart items
  DELETE FROM public.guest_cart_items WHERE guest_token = p_guest_token;
  
  -- Delete guest user
  DELETE FROM public.guest_users WHERE guest_token = p_guest_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Security Considerations

- Guest tokens are stored in local storage and in the database
- Row-level security policies ensure that guest users can only access their own data
- Security definer functions are used to enforce access control
- Guest data is automatically transferred to user accounts when users sign up or log in

## Future Improvements

- Add email verification for guest users
- Implement order tracking for guest users
- Allow guest users to view their order history using their email and order ID
- Add option to create an account after checkout
- Implement guest user data cleanup for old/unused guest accounts
