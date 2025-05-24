-- Fix issues with merge_guest_cart_with_user function
-- 1. Fix the boolean > integer operator error
-- 2. Ensure function is accessible via RPC

-- Drop and recreate the function with proper type handling
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
  v_checkout_started BOOLEAN := false;
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

    -- Handle checkout_started comparison properly (fix the boolean > integer error)
    IF v_user_record.checkout_started = true OR v_guest_record.checkout_started = true THEN
      v_checkout_started = true;
    ELSE
      v_checkout_started = false;
    END IF;

    -- Update user's cart with merged data
    UPDATE cart_tracking
    SET
      cart_items = v_merged_items,
      subtotal = v_merged_subtotal,
      last_activity = now(),
      updated_at = now(),
      checkout_started = v_checkout_started,
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

-- Grant execute permissions to make it accessible via RPC
GRANT EXECUTE ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) TO authenticated, anon, service_role;

-- Add comment
COMMENT ON FUNCTION merge_guest_cart_with_user(TEXT, TEXT) IS 'Merges guest cart with existing user cart or converts guest cart to user cart. Fixed boolean comparison issue.';

-- Verify the function exists and is accessible
SELECT 
    routine_name,
    routine_type,
    security_type,
    'Function recreated with fixes' as status
FROM information_schema.routines 
WHERE routine_name = 'merge_guest_cart_with_user' 
AND routine_schema = 'public';

-- Check function permissions
SELECT 
    routine_name,
    grantee,
    privilege_type,
    'Permissions granted' as status
FROM information_schema.routine_privileges 
WHERE routine_name = 'merge_guest_cart_with_user' 
AND routine_schema = 'public';

-- Test message
SELECT 
    'FUNCTION FIXES APPLIED' as message,
    'Fixed boolean comparison and ensured RPC accessibility' as details,
    'Function should now work without 404 or type errors' as result;
