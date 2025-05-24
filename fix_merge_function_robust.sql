-- Robust fix for merge_guest_cart_with_user function
-- This handles different possible data type scenarios for user_id column

-- First, let's check what data type user_id actually is
DO $$
DECLARE
    user_id_type text;
BEGIN
    SELECT data_type INTO user_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'user_id'
    AND table_schema = 'public';
    
    RAISE NOTICE 'cart_tracking.user_id data type: %', user_id_type;
END $$;

-- Drop existing function if it exists (all possible signatures)
DROP FUNCTION IF EXISTS merge_guest_cart_with_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS merge_guest_cart_with_user(TEXT, UUID);

-- Create the function with proper type handling
-- This version handles both TEXT and UUID user_id columns
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
  v_user_id_type text;
BEGIN
  -- Get the data type of user_id column
  SELECT data_type INTO v_user_id_type
  FROM information_schema.columns 
  WHERE table_name = 'cart_tracking' 
  AND column_name = 'user_id'
  AND table_schema = 'public';

  RAISE NOTICE 'Function called with guest_token: %, clerk_user_id: %', p_guest_token, p_clerk_user_id;
  RAISE NOTICE 'user_id column type: %', v_user_id_type;

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

  RAISE NOTICE 'Found guest record with % items', jsonb_array_length(v_guest_record.cart_items);

  -- Check if user already has a cart record
  -- Handle both TEXT and UUID data types
  IF v_user_id_type = 'uuid' THEN
    -- If user_id is UUID, we need to cast the Clerk ID
    BEGIN
      SELECT * INTO v_user_record
      FROM cart_tracking
      WHERE user_id = p_clerk_user_id::uuid
      LIMIT 1;
    EXCEPTION WHEN invalid_text_representation THEN
      -- If Clerk ID can't be cast to UUID, treat as no existing record
      v_user_record := NULL;
      RAISE NOTICE 'Clerk user ID cannot be cast to UUID, treating as new user';
    END;
  ELSE
    -- If user_id is TEXT, use direct comparison
    SELECT * INTO v_user_record
    FROM cart_tracking
    WHERE user_id = p_clerk_user_id
    LIMIT 1;
  END IF;

  IF v_user_record IS NOT NULL THEN
    RAISE NOTICE 'Found existing user cart, merging...';
    
    -- Merge cart items (combine arrays)
    v_merged_items = v_user_record.cart_items || v_guest_record.cart_items;

    -- Calculate new subtotal (simple sum)
    v_merged_subtotal = v_user_record.subtotal + v_guest_record.subtotal;

    -- Update user's cart with merged data
    IF v_user_id_type = 'uuid' THEN
      UPDATE cart_tracking
      SET
        cart_items = v_merged_items,
        subtotal = v_merged_subtotal,
        last_activity = now(),
        updated_at = now(),
        checkout_started = GREATEST(v_user_record.checkout_started::int, v_guest_record.checkout_started::int)::boolean,
        email = COALESCE(v_user_record.email, v_guest_record.email)
      WHERE user_id = p_clerk_user_id::uuid;
    ELSE
      UPDATE cart_tracking
      SET
        cart_items = v_merged_items,
        subtotal = v_merged_subtotal,
        last_activity = now(),
        updated_at = now(),
        checkout_started = GREATEST(v_user_record.checkout_started::int, v_guest_record.checkout_started::int)::boolean,
        email = COALESCE(v_user_record.email, v_guest_record.email)
      WHERE user_id = p_clerk_user_id;
    END IF;

    -- Delete the guest record
    DELETE FROM cart_tracking WHERE guest_token = p_guest_token;

    RAISE NOTICE 'Merged guest cart with existing user cart';

  ELSE
    RAISE NOTICE 'No existing user cart, converting guest cart...';
    
    -- No existing user cart, just convert the guest cart
    IF v_user_id_type = 'uuid' THEN
      BEGIN
        UPDATE cart_tracking
        SET
          user_id = p_clerk_user_id::uuid,
          guest_token = NULL,
          is_anonymous = false,
          updated_at = now()
        WHERE guest_token = p_guest_token;
      EXCEPTION WHEN invalid_text_representation THEN
        -- If we can't cast to UUID, keep as guest but log the issue
        RAISE NOTICE 'Cannot convert Clerk ID to UUID, keeping as guest cart';
        RETURN false;
      END;
    ELSE
      UPDATE cart_tracking
      SET
        user_id = p_clerk_user_id,
        guest_token = NULL,
        is_anonymous = false,
        updated_at = now()
      WHERE guest_token = p_guest_token;
    END IF;

    RAISE NOTICE 'Converted guest cart to user cart';
  END IF;

  -- Check if operation was successful
  GET DIAGNOSTICS v_success = ROW_COUNT;

  RAISE NOTICE 'Operation success: %, rows affected: %', v_success > 0, v_success;
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) TO authenticated, anon;

-- Add comment for documentation
COMMENT ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) IS 'Merges guest cart with existing user cart or converts guest cart to user cart. Handles both TEXT and UUID user_id columns.';

-- Test the function exists
SELECT 
    routine_name, 
    routine_type,
    'Function created successfully' as status
FROM information_schema.routines 
WHERE routine_name = 'merge_guest_cart_with_user' 
AND routine_schema = 'public';
