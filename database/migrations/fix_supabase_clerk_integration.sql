-- Fix RLS policies to work with proper Supabase-Clerk integration
-- This creates a profiles table to store user roles and updates RLS policies

-- Add missing columns to existing profiles table if they don't exist
DO $$
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'customer';
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.jwt()->>'sub');

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.jwt()->>'sub')
WITH CHECK (id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.jwt()->>'sub');

-- Drop existing product policies
DROP POLICY IF EXISTS "Products can be updated by admins" ON products;
DROP POLICY IF EXISTS "Products can be inserted by admins" ON products;
DROP POLICY IF EXISTS "Products can be deleted by admins" ON products;

-- Create new product policies that check the profiles table
CREATE POLICY "Products can be updated by admins"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.jwt()->>'sub'
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.jwt()->>'sub'
    AND role = 'admin'
  )
);

CREATE POLICY "Products can be inserted by admins"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.jwt()->>'sub'
    AND role = 'admin'
  )
);

CREATE POLICY "Products can be deleted by admins"
ON products
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.jwt()->>'sub'
    AND role = 'admin'
  )
);

-- Insert your admin profile (replace with your actual Clerk user ID)
-- You can find your Clerk user ID in the console logs (sub claim)
INSERT INTO profiles (id, email, role)
VALUES ('user_2xT8byDSEB1F9DbDRNWaAQ72P8X', 'your-email@example.com', 'admin')
ON CONFLICT (id)
DO UPDATE SET role = 'admin';

-- Test the JWT token parsing
SELECT
  'JWT TOKEN DEBUG (Proper Supabase-Clerk)' as message,
  auth.jwt() ->> 'sub' as user_id,
  auth.jwt() ->> 'aud' as audience,
  auth.jwt() ->> 'role' as supabase_role;

-- Check if admin profile exists
SELECT
  'ADMIN PROFILE CHECK' as message,
  id,
  COALESCE(email, 'No email') as email,
  role
FROM profiles
WHERE role = 'admin';

-- Verify the policies were created
SELECT
    'PRODUCTS POLICIES UPDATED FOR SUPABASE-CLERK' as message,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'products'
ORDER BY cmd, policyname;
