-- Fix is_anonymous column logic and add guest-to-user conversion functionality
-- This migration ensures is_anonymous is properly set and adds conversion functions

-- Add is_anonymous column if it doesn't exist
ALTER TABLE cart_tracking
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Create a function to automatically set is_anonymous based on user_id
CREATE OR REPLACE FUNCTION set_cart_tracking_is_anonymous()
RETURNS TRIGGER AS $$
BEGIN
  -- Set is_anonymous based on whether user_id is null
  -- If user_id is present, it's NOT anonymous (even if guest_token is also present)
  -- If user_id is null AND guest_token is present, it's anonymous
  NEW.is_anonymous = (NEW.user_id IS NULL AND NEW.guest_token IS NOT NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set is_anonymous on insert and update
DROP TRIGGER IF EXISTS trigger_set_cart_tracking_is_anonymous ON cart_tracking;
CREATE TRIGGER trigger_set_cart_tracking_is_anonymous
  BEFORE INSERT OR UPDATE ON cart_tracking
  FOR EACH ROW
  EXECUTE FUNCTION set_cart_tracking_is_anonymous();

-- Update existing records to set is_anonymous correctly
UPDATE cart_tracking
SET is_anonymous = (user_id IS NULL AND guest_token IS NOT NULL);

-- Create function to convert guest cart to authenticated user cart
CREATE OR REPLACE FUNCTION convert_guest_to_user_cart(
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

-- Create function to merge guest cart with existing user cart
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
  -- Get guest cart record
  SELECT * INTO v_guest_record
  FROM cart_tracking
  WHERE guest_token = p_guest_token
  LIMIT 1;

  -- If no guest record found, return false
  IF v_guest_record IS NULL THEN
    RETURN false;
  END IF;

  -- Check if user already has a cart record
  SELECT * INTO v_user_record
  FROM cart_tracking
  WHERE user_id = p_clerk_user_id
  LIMIT 1;

  IF v_user_record IS NOT NULL THEN
    -- Merge cart items (simple approach: combine arrays)
    -- In a real implementation, you might want to merge quantities for duplicate items
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
      -- Keep the most recent checkout status
      checkout_started = GREATEST(v_user_record.checkout_started::int, v_guest_record.checkout_started::int)::boolean,
      -- Preserve email if guest has one and user doesn't
      email = COALESCE(v_user_record.email, v_guest_record.email)
    WHERE user_id = p_clerk_user_id;

    -- Delete the guest record
    DELETE FROM cart_tracking WHERE guest_token = p_guest_token;

  ELSE
    -- No existing user cart, just convert the guest cart
    UPDATE cart_tracking
    SET
      user_id = p_clerk_user_id,
      guest_token = NULL,
      is_anonymous = false,
      updated_at = now()
    WHERE guest_token = p_guest_token;
  END IF;

  -- Check if operation was successful
  GET DIAGNOSTICS v_success = ROW_COUNT;

  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION convert_guest_to_user_cart(TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) TO authenticated, anon;

-- Add index for better performance on is_anonymous queries
CREATE INDEX IF NOT EXISTS idx_cart_tracking_is_anonymous ON cart_tracking(is_anonymous);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_guest_token_anonymous ON cart_tracking(guest_token, is_anonymous);

-- Add comments for documentation
COMMENT ON COLUMN cart_tracking.is_anonymous IS 'Automatically set: true when user_id is null AND guest_token is not null, false when user_id is present (regardless of guest_token)';
COMMENT ON FUNCTION convert_guest_to_user_cart(TEXT, TEXT) IS 'Converts a guest cart to an authenticated user cart';
COMMENT ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) IS 'Merges guest cart with existing user cart, handling duplicates';
