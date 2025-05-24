-- Function to clean up old guest user data
-- This function deletes guest users and their cart items that are older than the specified number of days
-- and have no associated orders
CREATE OR REPLACE FUNCTION public.cleanup_old_guest_data(p_days_old INTEGER DEFAULT 30)
RETURNS TABLE (
  deleted_users INTEGER,
  deleted_cart_items INTEGER
) AS $$
DECLARE
  v_deleted_users INTEGER;
  v_deleted_cart_items INTEGER;
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate cutoff date
  v_cutoff_date := NOW() - (p_days_old * INTERVAL '1 day');
  
  -- Delete cart items for old guest users
  WITH old_guests AS (
    SELECT guest_token
    FROM public.guest_users
    WHERE 
      created_at < v_cutoff_date
      AND NOT EXISTS (
        SELECT 1 
        FROM public.orders 
        WHERE orders.guest_token = guest_users.guest_token
      )
  )
  DELETE FROM public.guest_cart_items
  WHERE guest_token IN (SELECT guest_token FROM old_guests)
  RETURNING COUNT(*) INTO v_deleted_cart_items;
  
  -- Delete old guest users with no orders
  DELETE FROM public.guest_users
  WHERE 
    created_at < v_cutoff_date
    AND NOT EXISTS (
      SELECT 1 
      FROM public.orders 
      WHERE orders.guest_token = guest_users.guest_token
    )
  RETURNING COUNT(*) INTO v_deleted_users;
  
  -- Return results
  RETURN QUERY SELECT v_deleted_users, v_deleted_cart_items;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment on the function
COMMENT ON FUNCTION public.cleanup_old_guest_data IS 'Cleans up guest user data older than the specified number of days that have no associated orders';

-- Example usage:
-- SELECT * FROM public.cleanup_old_guest_data(30);
