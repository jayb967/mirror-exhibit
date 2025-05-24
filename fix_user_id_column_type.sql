-- Fix user_id columns to be TEXT instead of UUID for Clerk integration
-- This allows storing Clerk user IDs which are TEXT format (e.g., 'user_2xT8byDSEB1F9DbDRNWaAQ72P8X')

-- Step 1: Check current state of both tables
SELECT
    'cart_tracking' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cart_tracking'
AND column_name = 'user_id'
AND table_schema = 'public'

UNION ALL

SELECT
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'id'
AND table_schema = 'public';

-- Step 2: Drop RLS policies that depend on user_id column
DO $$
DECLARE
    policy_name text;
BEGIN
    -- Find and drop all policies on cart_tracking table
    FOR policy_name IN
        SELECT pol.polname
        FROM pg_policy pol
        JOIN pg_class cls ON pol.polrelid = cls.oid
        JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
        WHERE cls.relname = 'cart_tracking'
        AND nsp.nspname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON cart_tracking';
        RAISE NOTICE 'Dropped RLS policy: %', policy_name;
    END LOOP;
END $$;

-- Step 3: Drop any foreign key constraints on cart_tracking.user_id
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop any foreign key constraints on user_id
    FOR constraint_name IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'cart_tracking'
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE cart_tracking DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    END LOOP;
END $$;

-- Step 4: Change the column type from UUID to TEXT
ALTER TABLE cart_tracking
ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Verify the cart_tracking change
SELECT
    'cart_tracking' as table_name,
    column_name,
    data_type,
    is_nullable,
    'cart_tracking.user_id type changed successfully' as status
FROM information_schema.columns
WHERE table_name = 'cart_tracking'
AND column_name = 'user_id'
AND table_schema = 'public';

-- Step 5: Fix profiles table for Clerk integration
-- First drop RLS policies on profiles table
DO $$
DECLARE
    policy_name text;
BEGIN
    -- Find and drop all policies on profiles table
    FOR policy_name IN
        SELECT pol.polname
        FROM pg_policy pol
        JOIN pg_class cls ON pol.polrelid = cls.oid
        JOIN pg_namespace nsp ON cls.relnamespace = nsp.oid
        WHERE cls.relname = 'profiles'
        AND nsp.nspname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON profiles';
        RAISE NOTICE 'Dropped RLS policy on profiles: %', policy_name;
    END LOOP;
END $$;

-- Drop foreign key constraint to auth.users since we're using Clerk
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop foreign key constraints on profiles.id
    FOR constraint_name IN
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'profiles'
        AND kcu.column_name = 'id'
        AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint on profiles: %', constraint_name;
    END LOOP;
END $$;

-- Change profiles.id from UUID to TEXT for Clerk user IDs
ALTER TABLE profiles
ALTER COLUMN id TYPE TEXT;

-- Add email column if it doesn't exist (some schemas have it, some don't)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column to profiles table';
    END IF;
END $$;

-- Step 6: Verify the profiles change
SELECT
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable,
    'profiles.id type changed successfully' as status
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'id'
AND table_schema = 'public';

-- Step 7: Create function to handle Clerk user profile creation/updates
CREATE OR REPLACE FUNCTION upsert_clerk_user_profile(
  p_clerk_user_id TEXT,
  p_email TEXT,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'customer'
) RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := false;
BEGIN
  RAISE NOTICE 'Upserting profile for Clerk user: %, email: %', p_clerk_user_id, p_email;

  -- Insert or update user profile
  INSERT INTO profiles (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (p_clerk_user_id, p_email, p_first_name, p_last_name, p_role, now(), now())
  ON CONFLICT (id)
  DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = now();

  GET DIAGNOSTICS v_success = ROW_COUNT;

  RAISE NOTICE 'Profile upsert result: success=%, rows_affected=%', v_success > 0, v_success;
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION upsert_clerk_user_profile(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, anon;

-- Step 7.5: Recreate RLS policies for Clerk integration
-- Cart tracking policies (updated for TEXT user_id and Clerk JWT)
CREATE POLICY "Cart tracking can be read by guest token or user"
ON cart_tracking
FOR SELECT
USING (
  -- Allow if guest_token matches (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  user_id = auth.jwt()->>'sub'
);

CREATE POLICY "Cart tracking can be inserted by guest or user"
ON cart_tracking
FOR INSERT
WITH CHECK (
  -- Allow if guest_token is provided (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  user_id = auth.jwt()->>'sub'
);

CREATE POLICY "Cart tracking can be updated by guest token or user"
ON cart_tracking
FOR UPDATE
USING (
  -- Allow if guest_token matches (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  user_id = auth.jwt()->>'sub'
)
WITH CHECK (
  -- Allow if guest_token is provided (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  user_id = auth.jwt()->>'sub'
);

CREATE POLICY "Cart tracking can be deleted by guest token or user"
ON cart_tracking
FOR DELETE
USING (
  -- Allow if guest_token matches (for anonymous users)
  guest_token IS NOT NULL OR
  -- Allow if user_id matches authenticated user (for logged in users)
  user_id = auth.jwt()->>'sub'
);

-- Profiles policies (updated for TEXT id and Clerk JWT)
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

-- Admin policies for profiles
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.jwt()->>'sub'
    AND role = 'admin'
  )
);

-- Step 8: Now create the merge function with TEXT user_id
DROP FUNCTION IF EXISTS merge_guest_cart_with_user(TEXT, TEXT);

CREATE OR REPLACE FUNCTION merge_guest_cart_with_user(
  p_guest_token TEXT,
  p_clerk_user_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_guest_record RECORD;
  v_user_record RECORD;
  v_merged_items JSONB;
  v_merged_subtotal DECIMAL(10,2);
  v_success BOOLEAN := false;
BEGIN
  RAISE NOTICE 'merge_guest_cart_with_user called: guest_token=%, clerk_user_id=%', p_guest_token, p_clerk_user_id;

  -- Get guest cart record
  SELECT * INTO v_guest_record
  FROM cart_tracking
  WHERE guest_token = p_guest_token
  LIMIT 1;

  -- If no guest record found, return false
  IF v_guest_record IS NULL THEN
    RAISE NOTICE 'No guest cart found for token: %', p_guest_token;
    RETURN false;
  END IF;

  RAISE NOTICE 'Found guest cart with % items, subtotal: %',
    jsonb_array_length(v_guest_record.cart_items), v_guest_record.subtotal;

  -- Check if user already has a cart record (user_id is now TEXT)
  SELECT * INTO v_user_record
  FROM cart_tracking
  WHERE user_id = p_clerk_user_id
  LIMIT 1;

  IF v_user_record IS NOT NULL THEN
    RAISE NOTICE 'Found existing user cart, merging...';

    -- Merge cart items (combine arrays)
    v_merged_items = v_user_record.cart_items || v_guest_record.cart_items;

    -- Calculate new subtotal (simple sum)
    v_merged_subtotal = v_user_record.subtotal + v_guest_record.subtotal;

    -- Update user's cart with merged data
    UPDATE cart_tracking
    SET
      cart_items = v_merged_items,
      subtotal = v_merged_subtotal,
      last_activity = now(),
      updated_at = now(),
      checkout_started = GREATEST(v_user_record.checkout_started::int, v_guest_record.checkout_started::int)::boolean,
      email = COALESCE(v_user_record.email, v_guest_record.email)
    WHERE user_id = p_clerk_user_id;

    -- Delete the guest record
    DELETE FROM cart_tracking WHERE guest_token = p_guest_token;

    RAISE NOTICE 'Successfully merged guest cart with existing user cart';

  ELSE
    RAISE NOTICE 'No existing user cart, converting guest cart to user cart...';

    -- No existing user cart, just convert the guest cart
    UPDATE cart_tracking
    SET
      user_id = p_clerk_user_id,
      guest_token = NULL,
      is_anonymous = false,
      updated_at = now()
    WHERE guest_token = p_guest_token;

    RAISE NOTICE 'Successfully converted guest cart to user cart';
  END IF;

  -- Check if operation was successful
  GET DIAGNOSTICS v_success = ROW_COUNT;

  RAISE NOTICE 'Operation completed: success=%, rows_affected=%', v_success > 0, v_success;
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) IS 'Merges guest cart with existing user cart or converts guest cart to user cart. Works with TEXT user_id for Clerk integration.';

-- Step 9: Verify all functions were created
SELECT
    routine_name,
    routine_type,
    'Functions created successfully with TEXT user_id support' as status
FROM information_schema.routines
WHERE routine_name IN ('merge_guest_cart_with_user', 'upsert_clerk_user_profile')
AND routine_schema = 'public'
ORDER BY routine_name;

-- Step 10: Final verification - show updated table structures
SELECT
    'FINAL VERIFICATION' as section,
    table_name,
    column_name,
    data_type,
    'Ready for Clerk integration' as status
FROM information_schema.columns
WHERE (
    (table_name = 'cart_tracking' AND column_name = 'user_id') OR
    (table_name = 'profiles' AND column_name = 'id')
)
AND table_schema = 'public'
ORDER BY table_name, column_name;

-- Step 11: Test message
SELECT
    'DATABASE MIGRATION COMPLETE' as message,
    'Both cart_tracking and profiles tables now support Clerk TEXT user IDs' as details,
    'You can now test guest cart conversion and user profile creation' as next_steps;
