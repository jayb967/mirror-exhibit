-- Fix missing UPDATE and INSERT policies for products table
-- This allows admin users to create and update products

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Products can be updated by admins" ON products;
DROP POLICY IF EXISTS "Products can be inserted by admins" ON products;

-- Create UPDATE policy for products (admin only)
CREATE POLICY "Products can be updated by admins" 
ON products 
FOR UPDATE 
TO authenticated
USING (
  -- Check if user has admin role in various possible metadata locations
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'publicMetadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'privateMetadata')::jsonb ->> 'role' = 'admin' OR
  -- Also check profiles table for admin role
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
)
WITH CHECK (
  -- Same check for the WITH CHECK clause
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'publicMetadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'privateMetadata')::jsonb ->> 'role' = 'admin' OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

-- Create INSERT policy for products (admin only)
CREATE POLICY "Products can be inserted by admins" 
ON products 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Check if user has admin role in various possible metadata locations
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'publicMetadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'privateMetadata')::jsonb ->> 'role' = 'admin' OR
  -- Also check profiles table for admin role
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

-- Also create DELETE policy for products (admin only)
CREATE POLICY "Products can be deleted by admins" 
ON products 
FOR DELETE 
TO authenticated
USING (
  -- Check if user has admin role in various possible metadata locations
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'publicMetadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'privateMetadata')::jsonb ->> 'role' = 'admin' OR
  -- Also check profiles table for admin role
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.jwt()->>'sub' 
    AND role = 'admin'
  )
);

-- Verify the policies were created
SELECT 
    'PRODUCTS POLICIES CREATED' as message,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd, policyname;
