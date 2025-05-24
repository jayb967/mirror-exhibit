-- Migration to support Clerk authentication integration
-- This migration updates RLS policies to work with Clerk JWT tokens and fixes database issues

-- First, fix the cart_tracking table constraints
-- Add unique constraint on guest_token if it doesn't exist
DO $$
BEGIN
  -- Check if unique constraint exists on guest_token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cart_tracking_guest_token_unique'
    AND table_name = 'cart_tracking'
  ) THEN
    ALTER TABLE cart_tracking ADD CONSTRAINT cart_tracking_guest_token_unique UNIQUE (guest_token);
  END IF;
END $$;

-- Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cart_tracking_user_id_unique'
    AND table_name = 'cart_tracking'
  ) THEN
    ALTER TABLE cart_tracking ADD CONSTRAINT cart_tracking_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Update RLS policies for cart_items table to work with Clerk
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;

-- Create new RLS policies for cart_items that work with Clerk
CREATE POLICY "Users can view their own cart items"
ON cart_items
FOR SELECT
TO authenticated
USING (
  -- Check if the user_id matches the Clerk user ID from JWT
  user_id::text = auth.jwt()->>'sub'
);

CREATE POLICY "Users can insert their own cart items"
ON cart_items
FOR INSERT
TO authenticated
WITH CHECK (
  -- Ensure user_id matches the Clerk user ID from JWT
  user_id::text = auth.jwt()->>'sub'
);

CREATE POLICY "Users can update their own cart items"
ON cart_items
FOR UPDATE
TO authenticated
USING (
  user_id::text = auth.jwt()->>'sub'
)
WITH CHECK (
  user_id::text = auth.jwt()->>'sub'
);

CREATE POLICY "Users can delete their own cart items"
ON cart_items
FOR DELETE
TO authenticated
USING (
  user_id::text = auth.jwt()->>'sub'
);

-- Update RLS policies for orders table to work with Clerk
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;

CREATE POLICY "Users can view their own orders"
ON orders
FOR SELECT
TO authenticated
USING (
  user_id::text = auth.jwt()->>'sub' OR guest_token IS NOT NULL
);

CREATE POLICY "Users can insert their own orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  user_id::text = auth.jwt()->>'sub' OR guest_token IS NOT NULL
);

-- Update RLS policies for profiles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

    CREATE POLICY "Users can view their own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (
      id::text = auth.jwt()->>'sub'
    );

    CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (
      id::text = auth.jwt()->>'sub'
    )
    WITH CHECK (
      id::text = auth.jwt()->>'sub'
    );

    CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
      id::text = auth.jwt()->>'sub'
    );
  END IF;
END $$;

-- Create a function to handle Clerk user creation/updates
CREATE OR REPLACE FUNCTION handle_clerk_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to sync Clerk user data with local tables
  -- For now, it's a placeholder that can be extended as needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update the guest_users table to support Clerk integration
-- Ensure guest_users table has the right structure
DO $$
BEGIN
  -- Check if guest_users table exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_users') THEN
    CREATE TABLE guest_users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
      guest_token TEXT UNIQUE NOT NULL,
      user_id TEXT, -- For Clerk anonymous user IDs
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE guest_users ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Guest users can be read by anyone" ON guest_users FOR SELECT USING (true);
    CREATE POLICY "Guest users can be inserted by anyone" ON guest_users FOR INSERT WITH CHECK (true);
    CREATE POLICY "Guest users can be updated by anyone" ON guest_users FOR UPDATE USING (true);
  ELSE
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'guest_users' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE guest_users ADD COLUMN user_id TEXT;
    END IF;
  END IF;
END $$;

-- Update guest user functions to work with Clerk anonymous users
CREATE OR REPLACE FUNCTION create_anonymous_guest_user(
  p_guest_token TEXT,
  p_user_id TEXT
) RETURNS VOID AS $$
BEGIN
  -- Insert or update guest user with Clerk anonymous user ID
  INSERT INTO guest_users (guest_token, user_id, created_at, updated_at)
  VALUES (p_guest_token, p_user_id, now(), now())
  ON CONFLICT (guest_token)
  DO UPDATE SET
    user_id = p_user_id,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert guest cart to authenticated user cart (Clerk version)
CREATE OR REPLACE FUNCTION convert_guest_to_clerk_user(
  p_guest_token TEXT,
  p_clerk_user_id TEXT
) RETURNS VOID AS $$
BEGIN
  -- Move guest cart items to authenticated user (if cart_items table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items' AND table_schema = 'public') THEN
    UPDATE cart_items
    SET user_id = p_clerk_user_id::uuid, guest_token = NULL
    WHERE guest_token = p_guest_token;
  END IF;

  -- Move guest orders to authenticated user (if orders table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
    UPDATE orders
    SET user_id = p_clerk_user_id::uuid, guest_token = NULL
    WHERE guest_token = p_guest_token;
  END IF;

  -- Update cart tracking (if cart_tracking table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_tracking' AND table_schema = 'public') THEN
    UPDATE cart_tracking
    SET user_id = p_clerk_user_id, guest_token = NULL
    WHERE guest_token = p_guest_token;
  END IF;

  -- Clean up guest user record
  DELETE FROM guest_users WHERE guest_token = p_guest_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_anonymous_guest_user(TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION convert_guest_to_clerk_user(TEXT, TEXT) TO authenticated, anon;
