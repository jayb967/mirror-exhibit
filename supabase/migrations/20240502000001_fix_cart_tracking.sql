-- Fix cart_tracking table to support proper upsert operations
-- This migration adds unique constraints and ensures guest_users table exists

-- Add unique constraint on guest_token for cart_tracking table
-- This allows ON CONFLICT operations to work properly
DO $$
BEGIN
  -- Check if unique constraint exists on guest_token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cart_tracking_guest_token_unique' 
    AND table_name = 'cart_tracking'
    AND table_schema = 'public'
  ) THEN
    -- First, remove any duplicate guest_token entries (keep the most recent)
    DELETE FROM cart_tracking 
    WHERE id NOT IN (
      SELECT DISTINCT ON (guest_token) id 
      FROM cart_tracking 
      WHERE guest_token IS NOT NULL
      ORDER BY guest_token, updated_at DESC
    ) AND guest_token IS NOT NULL;
    
    -- Add the unique constraint
    ALTER TABLE cart_tracking ADD CONSTRAINT cart_tracking_guest_token_unique UNIQUE (guest_token);
  END IF;
END $$;

-- Ensure guest_users table exists with proper structure
DO $$
BEGIN
  -- Check if guest_users table exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guest_users' AND table_schema = 'public') THEN
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
    
    -- Create policies for guest_users
    CREATE POLICY "Guest users can be read by anyone" ON guest_users FOR SELECT USING (true);
    CREATE POLICY "Guest users can be inserted by anyone" ON guest_users FOR INSERT WITH CHECK (true);
    CREATE POLICY "Guest users can be updated by anyone" ON guest_users FOR UPDATE USING (true);
    CREATE POLICY "Guest users can be deleted by anyone" ON guest_users FOR DELETE USING (true);
  ELSE
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'guest_users' AND column_name = 'user_id' AND table_schema = 'public'
    ) THEN
      ALTER TABLE guest_users ADD COLUMN user_id TEXT;
    END IF;
  END IF;
END $$;

-- Create or replace function for anonymous guest user creation
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

-- Create or replace function for converting guest to Clerk user
CREATE OR REPLACE FUNCTION convert_guest_to_clerk_user(
  p_guest_token TEXT,
  p_clerk_user_id TEXT
) RETURNS VOID AS $$
BEGIN
  -- Move guest cart items to authenticated user (if cart_items table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items' AND table_schema = 'public') THEN
    UPDATE cart_items 
    SET user_id = p_clerk_user_id, guest_token = NULL
    WHERE guest_token = p_guest_token;
  END IF;
  
  -- Move guest orders to authenticated user (if orders table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders' AND table_schema = 'public') THEN
    UPDATE orders 
    SET user_id = p_clerk_user_id, guest_token = NULL
    WHERE guest_token = p_guest_token;
  END IF;
  
  -- Update cart tracking
  UPDATE cart_tracking 
  SET user_id = p_clerk_user_id, guest_token = NULL
  WHERE guest_token = p_guest_token;
  
  -- Clean up guest user record
  DELETE FROM guest_users WHERE guest_token = p_guest_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_anonymous_guest_user(TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION convert_guest_to_clerk_user(TEXT, TEXT) TO authenticated, anon;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guest_users_guest_token ON guest_users(guest_token);
CREATE INDEX IF NOT EXISTS idx_guest_users_user_id ON guest_users(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_guest_token ON cart_tracking(guest_token);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_user_id ON cart_tracking(user_id);
