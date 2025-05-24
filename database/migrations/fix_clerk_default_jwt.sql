-- Fix RLS policies to work with Clerk's default JWT format (no custom templates)
-- This updates the products table policies to work with Clerk's built-in JWT structure

-- Drop existing policies
DROP POLICY IF EXISTS "Products can be updated by admins" ON products;
DROP POLICY IF EXISTS "Products can be inserted by admins" ON products;
DROP POLICY IF EXISTS "Products can be deleted by admins" ON products;

-- Create UPDATE policy for products (Clerk default JWT)
CREATE POLICY "Products can be updated by admins" 
ON products 
FOR UPDATE 
TO authenticated
USING (
  -- Check if user has admin role in Clerk's default JWT structure
  -- Clerk stores metadata in different locations in their default JWT
  (auth.jwt() -> 'public_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'private_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'unsafe_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() ->> 'role') = 'admin'
)
WITH CHECK (
  -- Same check for the WITH CHECK clause
  (auth.jwt() -> 'public_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'private_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'unsafe_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() ->> 'role') = 'admin'
);

-- Create INSERT policy for products (Clerk default JWT)
CREATE POLICY "Products can be inserted by admins" 
ON products 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Check if user has admin role in Clerk's default JWT structure
  (auth.jwt() -> 'public_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'private_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'unsafe_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() ->> 'role') = 'admin'
);

-- Create DELETE policy for products (Clerk default JWT)
CREATE POLICY "Products can be deleted by admins" 
ON products 
FOR DELETE 
TO authenticated
USING (
  -- Check if user has admin role in Clerk's default JWT structure
  (auth.jwt() -> 'public_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'private_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'unsafe_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() ->> 'role') = 'admin'
);

-- Test the JWT token parsing (for debugging)
-- This will show what's in the current JWT token
SELECT 
  'JWT TOKEN DEBUG (Clerk Default)' as message,
  auth.jwt() as full_token,
  auth.jwt() ->> 'sub' as user_id,
  auth.jwt() ->> 'email' as email,
  auth.jwt() -> 'public_metadata' ->> 'role' as public_metadata_role,
  auth.jwt() -> 'private_metadata' ->> 'role' as private_metadata_role,
  auth.jwt() -> 'unsafe_metadata' ->> 'role' as unsafe_metadata_role,
  auth.jwt() ->> 'role' as direct_role;

-- Verify the policies were created
SELECT 
    'PRODUCTS POLICIES UPDATED FOR CLERK DEFAULT JWT' as message,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd, policyname;
