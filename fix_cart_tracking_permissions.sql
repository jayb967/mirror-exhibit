-- Fix cart_tracking table permissions and ensure proper RLS policies for Clerk auth
-- This SQL file fixes the 406 errors when accessing cart_tracking table

-- First, ensure the cart_tracking table has proper structure
DO $$
BEGIN
  -- Add is_anonymous column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_tracking'
    AND column_name = 'is_anonymous'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Ensure user_id column is TEXT type for Clerk compatibility
DO $$
BEGIN
  -- Check if user_id is UUID type and convert to TEXT if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_tracking'
    AND column_name = 'user_id'
    AND data_type = 'uuid'
  ) THEN
    -- Drop foreign key constraint if it exists
    ALTER TABLE cart_tracking DROP CONSTRAINT IF EXISTS cart_tracking_user_id_fkey;
    -- Change column type to TEXT for Clerk user IDs
    ALTER TABLE cart_tracking ALTER COLUMN user_id TYPE TEXT;
  END IF;
END $$;

-- Update existing records to set is_anonymous correctly
UPDATE cart_tracking
SET is_anonymous = (user_id IS NULL AND guest_token IS NOT NULL)
WHERE is_anonymous IS NULL;

-- Ensure RLS is enabled
ALTER TABLE cart_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS cart_tracking_select_user ON cart_tracking;
DROP POLICY IF EXISTS cart_tracking_insert_user ON cart_tracking;
DROP POLICY IF EXISTS cart_tracking_update_user ON cart_tracking;
DROP POLICY IF EXISTS cart_tracking_delete_user ON cart_tracking;
DROP POLICY IF EXISTS "Cart tracking can be read by guest token or user" ON cart_tracking;
DROP POLICY IF EXISTS "Cart tracking can be inserted by anyone" ON cart_tracking;
DROP POLICY IF EXISTS "Cart tracking can be updated by guest token or user" ON cart_tracking;
DROP POLICY IF EXISTS "Cart tracking can be deleted by guest token or user" ON cart_tracking;

-- Policy for users to select their own cart tracking data (Clerk compatible + anonymous access)
CREATE POLICY cart_tracking_select_user ON cart_tracking
  FOR SELECT
  USING (
    -- Allow authenticated users to see their own records
    (auth.jwt() IS NOT NULL AND auth.jwt()->>'sub' IS NOT NULL AND user_id = auth.jwt()->>'sub') OR
    -- Allow anonymous users to see records with guest tokens (no auth required)
    (auth.jwt() IS NULL AND user_id IS NULL AND guest_token IS NOT NULL) OR
    -- Allow any access to guest records (fallback for anonymous users)
    (user_id IS NULL AND guest_token IS NOT NULL)
  );

-- Policy for users to insert their own cart tracking data (Clerk compatible + anonymous access)
CREATE POLICY cart_tracking_insert_user ON cart_tracking
  FOR INSERT
  WITH CHECK (
    -- Allow authenticated users to insert with their user_id
    (auth.jwt() IS NOT NULL AND auth.jwt()->>'sub' IS NOT NULL AND user_id = auth.jwt()->>'sub') OR
    -- Allow anonymous users to insert guest records
    (user_id IS NULL) OR
    -- Allow any guest record insertion (fallback)
    (guest_token IS NOT NULL)
  );

-- Policy for users to update their own cart tracking data (Clerk compatible + anonymous access)
CREATE POLICY cart_tracking_update_user ON cart_tracking
  FOR UPDATE
  USING (
    -- Allow authenticated users to update their own records
    (auth.jwt() IS NOT NULL AND auth.jwt()->>'sub' IS NOT NULL AND user_id = auth.jwt()->>'sub') OR
    -- Allow anonymous users to update guest records
    (auth.jwt() IS NULL AND user_id IS NULL AND guest_token IS NOT NULL) OR
    -- Allow any access to guest records (fallback)
    (user_id IS NULL AND guest_token IS NOT NULL)
  );

-- Policy for users to delete their own cart tracking data (Clerk compatible + anonymous access)
CREATE POLICY cart_tracking_delete_user ON cart_tracking
  FOR DELETE
  USING (
    -- Allow authenticated users to delete their own records
    (auth.jwt() IS NOT NULL AND auth.jwt()->>'sub' IS NOT NULL AND user_id = auth.jwt()->>'sub') OR
    -- Allow anonymous users to delete guest records
    (auth.jwt() IS NULL AND user_id IS NULL AND guest_token IS NOT NULL) OR
    -- Allow any access to guest records (fallback)
    (user_id IS NULL AND guest_token IS NOT NULL)
  );

-- Grant necessary permissions
GRANT ALL ON cart_tracking TO authenticated;
GRANT ALL ON cart_tracking TO anon;

-- Create trigger to automatically set is_anonymous
CREATE OR REPLACE FUNCTION set_cart_tracking_is_anonymous()
RETURNS TRIGGER AS $$
BEGIN
  -- Set is_anonymous based on whether user_id is null
  NEW.is_anonymous = (NEW.user_id IS NULL AND NEW.guest_token IS NOT NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS cart_tracking_set_is_anonymous ON cart_tracking;

-- Create trigger for insert and update
CREATE TRIGGER cart_tracking_set_is_anonymous
  BEFORE INSERT OR UPDATE ON cart_tracking
  FOR EACH ROW
  EXECUTE FUNCTION set_cart_tracking_is_anonymous();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_tracking_user_id ON cart_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_guest_token ON cart_tracking(guest_token);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_is_anonymous ON cart_tracking(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_guest_token_anonymous ON cart_tracking(guest_token, is_anonymous);

-- Add comments for documentation
COMMENT ON TABLE cart_tracking IS 'Tracks cart activity for both authenticated and guest users';
COMMENT ON COLUMN cart_tracking.is_anonymous IS 'Automatically set: true when user_id is null AND guest_token is not null, false when user_id is present';
COMMENT ON COLUMN cart_tracking.guest_token IS 'Guest token for anonymous users, null for authenticated users';
COMMENT ON COLUMN cart_tracking.user_id IS 'User ID for authenticated users, null for guest users';

-- Ensure the table has proper constraints
DO $$
BEGIN
  -- Add constraint to ensure either user_id or guest_token is present
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'cart_tracking_user_or_guest'
    AND table_name = 'cart_tracking'
  ) THEN
    ALTER TABLE cart_tracking ADD CONSTRAINT cart_tracking_user_or_guest CHECK (
      (user_id IS NOT NULL) OR (guest_token IS NOT NULL) OR (email IS NOT NULL)
    );
  END IF;
END $$;

-- Create function to merge guest cart with user cart (if it doesn't exist)
CREATE OR REPLACE FUNCTION merge_guest_cart_with_user(
  p_guest_token TEXT,
  p_clerk_user_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := false;
BEGIN
  -- Update cart_tracking record to convert guest to user
  UPDATE cart_tracking
  SET
    user_id = p_clerk_user_id,
    guest_token = NULL,
    is_anonymous = false,
    updated_at = now()
  WHERE guest_token = p_guest_token;

  -- Check if update was successful
  GET DIAGNOSTICS v_success = ROW_COUNT;

  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) TO authenticated, anon;

-- Add comment
COMMENT ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) IS 'Merges guest cart with authenticated user cart';
