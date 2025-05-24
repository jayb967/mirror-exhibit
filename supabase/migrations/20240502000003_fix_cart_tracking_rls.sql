-- Fix cart_tracking RLS policies to allow anonymous access for guest users
-- This migration updates RLS policies to work with guest cart functionality

-- Drop existing policies for cart_tracking
DROP POLICY IF EXISTS "Users can view their own cart tracking" ON cart_tracking;
DROP POLICY IF EXISTS "Users can insert their own cart tracking" ON cart_tracking;
DROP POLICY IF EXISTS "Users can update their own cart tracking" ON cart_tracking;
DROP POLICY IF EXISTS "Users can delete their own cart tracking" ON cart_tracking;

-- Create new policies that allow both authenticated and anonymous access

-- Allow anonymous users to read cart tracking by guest_token
CREATE POLICY "Cart tracking can be read by guest token or user"
ON cart_tracking
FOR SELECT
USING (
  -- Allow if guest_token matches (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  (auth.uid() IS NOT NULL AND user_id::text = auth.jwt()->>'sub')
);

-- Allow anonymous users to insert cart tracking
CREATE POLICY "Cart tracking can be inserted by anyone"
ON cart_tracking
FOR INSERT
WITH CHECK (
  -- Allow if guest_token is provided (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  (auth.uid() IS NOT NULL AND user_id::text = auth.jwt()->>'sub')
);

-- Allow anonymous users to update cart tracking by guest_token
CREATE POLICY "Cart tracking can be updated by guest token or user"
ON cart_tracking
FOR UPDATE
USING (
  -- Allow if guest_token matches (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  (auth.uid() IS NOT NULL AND user_id::text = auth.jwt()->>'sub')
)
WITH CHECK (
  -- Allow if guest_token is provided (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  (auth.uid() IS NOT NULL AND user_id::text = auth.jwt()->>'sub')
);

-- Allow anonymous users to delete cart tracking by guest_token
CREATE POLICY "Cart tracking can be deleted by guest token or user"
ON cart_tracking
FOR DELETE
USING (
  -- Allow if guest_token matches (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  (auth.uid() IS NOT NULL AND user_id::text = auth.jwt()->>'sub')
);

-- Also update guest_users table policies to allow anonymous access
DROP POLICY IF EXISTS "Guest users can be read by anyone" ON guest_users;
DROP POLICY IF EXISTS "Guest users can be inserted by anyone" ON guest_users;
DROP POLICY IF EXISTS "Guest users can be updated by anyone" ON guest_users;
DROP POLICY IF EXISTS "Guest users can be deleted by anyone" ON guest_users;

-- Create permissive policies for guest_users (since it's for anonymous users)
CREATE POLICY "Guest users can be accessed by anyone"
ON guest_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to anonymous users
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_tracking TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON guest_users TO anon;

-- Also ensure authenticated users have access
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_tracking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON guest_users TO authenticated;
