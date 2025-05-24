-- Fix RLS policies to work with Clerk JWT tokens
-- This updates the products table policies to properly check Clerk authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Products can be updated by admins" ON products;
DROP POLICY IF EXISTS "Products can be inserted by admins" ON products;
DROP POLICY IF EXISTS "Products can be deleted by admins" ON products;

-- Create UPDATE policy for products (Clerk admin users)
CREATE POLICY "Products can be updated by admins" 
ON products 
FOR UPDATE 
TO authenticated
USING (
  -- Check if user has admin role in Clerk JWT token
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'privateMetadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  -- Same check for the WITH CHECK clause
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'privateMetadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Create INSERT policy for products (Clerk admin users)
CREATE POLICY "Products can be inserted by admins" 
ON products 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Check if user has admin role in Clerk JWT token
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'privateMetadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Create DELETE policy for products (Clerk admin users)
CREATE POLICY "Products can be deleted by admins" 
ON products 
FOR DELETE 
TO authenticated
USING (
  -- Check if user has admin role in Clerk JWT token
  (auth.jwt() ->> 'role') = 'admin' OR
  (auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'privateMetadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Test the JWT token parsing (for debugging)
-- This will show what's in the current JWT token
SELECT 
  'JWT TOKEN DEBUG' as message,
  auth.jwt() as full_token,
  auth.jwt() ->> 'sub' as user_id,
  auth.jwt() ->> 'email' as email,
  auth.jwt() ->> 'role' as direct_role,
  auth.jwt() -> 'publicMetadata' ->> 'role' as public_metadata_role,
  auth.jwt() -> 'privateMetadata' ->> 'role' as private_metadata_role,
  auth.jwt() -> 'app_metadata' ->> 'role' as app_metadata_role,
  auth.jwt() -> 'user_metadata' ->> 'role' as user_metadata_role;

-- Verify the policies were created
SELECT 
    'PRODUCTS POLICIES UPDATED' as message,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd, policyname;
