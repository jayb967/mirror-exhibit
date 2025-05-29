-- Fix user profiles and ensure proper Clerk integration
-- Run this in Supabase SQL Editor

-- Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Use TEXT for Clerk user IDs
  email TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
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

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create policies for profiles (using Clerk user IDs)
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.jwt() ->> 'sub'
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.jwt() ->> 'sub'
      AND role = 'admin'
    )
  );

-- Ensure notification_preferences table exists
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_order_updates BOOLEAN DEFAULT true,
  email_shipping_updates BOOLEAN DEFAULT true,
  email_promotional BOOLEAN DEFAULT true,
  email_system_updates BOOLEAN DEFAULT true,
  in_app_order_updates BOOLEAN DEFAULT true,
  in_app_shipping_updates BOOLEAN DEFAULT true,
  in_app_promotional BOOLEAN DEFAULT true,
  in_app_system_updates BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_preferences
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;

CREATE POLICY "Users can view own notification preferences" ON notification_preferences
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update own notification preferences" ON notification_preferences
  FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

-- Create or replace function to create notification preferences for new users
CREATE OR REPLACE FUNCTION create_user_notification_preferences(user_uuid TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    email_order_updates,
    email_shipping_updates,
    email_promotional,
    email_system_updates,
    in_app_order_updates,
    in_app_shipping_updates,
    in_app_promotional,
    in_app_system_updates
  ) VALUES (
    user_uuid,
    true,  -- email_order_updates
    true,  -- email_shipping_updates
    true,  -- email_promotional
    true,  -- email_system_updates
    true,  -- in_app_order_updates
    true,  -- in_app_shipping_updates
    true,  -- in_app_promotional
    false  -- in_app_system_updates
  )
  ON CONFLICT (user_id) DO NOTHING; -- Don't create duplicates
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update shipping_addresses table to use TEXT for user_id (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shipping_addresses') THEN
    -- Check if user_id column exists and its type
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'shipping_addresses'
      AND column_name = 'user_id'
      AND data_type = 'uuid'
    ) THEN
      -- Drop all policies that depend on user_id column first
      DROP POLICY IF EXISTS "shipping_addresses_select_user" ON shipping_addresses;
      DROP POLICY IF EXISTS "shipping_addresses_insert_user" ON shipping_addresses;
      DROP POLICY IF EXISTS "shipping_addresses_update_user" ON shipping_addresses;
      DROP POLICY IF EXISTS "shipping_addresses_delete_user" ON shipping_addresses;
      DROP POLICY IF EXISTS "Users can view own shipping addresses" ON shipping_addresses;
      DROP POLICY IF EXISTS "Users can insert own shipping addresses" ON shipping_addresses;
      DROP POLICY IF EXISTS "Users can update own shipping addresses" ON shipping_addresses;
      DROP POLICY IF EXISTS "Users can delete own shipping addresses" ON shipping_addresses;

      -- Drop foreign key constraint if it exists
      ALTER TABLE shipping_addresses DROP CONSTRAINT IF EXISTS shipping_addresses_user_id_fkey;

      -- Change user_id column type to TEXT
      ALTER TABLE shipping_addresses ALTER COLUMN user_id TYPE TEXT;

      -- Add foreign key constraint to profiles table
      ALTER TABLE shipping_addresses
      ADD CONSTRAINT shipping_addresses_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

      -- Recreate policies for shipping_addresses
      CREATE POLICY "Users can view own shipping addresses" ON shipping_addresses
        FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

      CREATE POLICY "Users can insert own shipping addresses" ON shipping_addresses
        FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

      CREATE POLICY "Users can update own shipping addresses" ON shipping_addresses
        FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

      CREATE POLICY "Users can delete own shipping addresses" ON shipping_addresses
        FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);
    END IF;
  END IF;
END $$;

-- Update cart_items table to use TEXT for user_id (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cart_items') THEN
    -- Check if user_id column exists and its type
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'cart_items'
      AND column_name = 'user_id'
      AND data_type = 'uuid'
    ) THEN
      -- Drop all policies that depend on user_id column first
      DROP POLICY IF EXISTS "cart_items_select_user" ON cart_items;
      DROP POLICY IF EXISTS "cart_items_insert_user" ON cart_items;
      DROP POLICY IF EXISTS "cart_items_update_user" ON cart_items;
      DROP POLICY IF EXISTS "cart_items_delete_user" ON cart_items;
      DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
      DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
      DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
      DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

      -- Drop foreign key constraint if it exists
      ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;

      -- Change user_id column type to TEXT
      ALTER TABLE cart_items ALTER COLUMN user_id TYPE TEXT;

      -- Add foreign key constraint to profiles table
      ALTER TABLE cart_items
      ADD CONSTRAINT cart_items_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

      -- Recreate policies for cart_items
      CREATE POLICY "Users can view own cart items" ON cart_items
        FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

      CREATE POLICY "Users can insert own cart items" ON cart_items
        FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

      CREATE POLICY "Users can update own cart items" ON cart_items
        FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

      CREATE POLICY "Users can delete own cart items" ON cart_items
        FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);
    END IF;
  END IF;
END $$;

-- Update orders table to use TEXT for user_id (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    -- Check if user_id column exists and its type
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'orders'
      AND column_name = 'user_id'
      AND data_type = 'uuid'
    ) THEN
      -- Drop all policies that depend on user_id column first
      DROP POLICY IF EXISTS "orders_select_user" ON orders;
      DROP POLICY IF EXISTS "orders_insert_user" ON orders;
      DROP POLICY IF EXISTS "orders_update_user" ON orders;
      DROP POLICY IF EXISTS "orders_delete_user" ON orders;
      DROP POLICY IF EXISTS "Users can view own orders" ON orders;
      DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
      DROP POLICY IF EXISTS "Users can update own orders" ON orders;
      DROP POLICY IF EXISTS "Users can delete own orders" ON orders;

      -- Drop foreign key constraint if it exists
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

      -- Change user_id column type to TEXT
      ALTER TABLE orders ALTER COLUMN user_id TYPE TEXT;

      -- Add foreign key constraint to profiles table
      ALTER TABLE orders
      ADD CONSTRAINT orders_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

      -- Recreate policies for orders (if they existed)
      -- Note: Orders policies might be different, so we'll create basic ones
      CREATE POLICY "Users can view own orders" ON orders
        FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

      CREATE POLICY "Users can insert own orders" ON orders
        FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);
    END IF;
  END IF;
END $$;

-- Create a function to manually create profiles for existing Clerk users
CREATE OR REPLACE FUNCTION create_profile_for_clerk_user(
  clerk_user_id TEXT,
  user_email TEXT DEFAULT NULL,
  user_first_name TEXT DEFAULT NULL,
  user_last_name TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'customer'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    clerk_user_id,
    user_email,
    user_first_name,
    user_last_name,
    user_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();

  -- Also create notification preferences
  PERFORM create_user_notification_preferences(clerk_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Display completion message
SELECT 'User profiles and Clerk integration setup completed successfully!' as status;
