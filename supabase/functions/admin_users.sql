-- Function to get all users with pagination (admin only)
CREATE OR REPLACE FUNCTION admin_get_users(
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 10,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  users profiles[],
  total_count BIGINT
) AS $$
DECLARE
  v_offset INTEGER;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view users';
  END IF;

  v_offset := (p_page - 1) * p_limit;

  RETURN QUERY
  WITH filtered_users AS (
    SELECT p.*, u.email, u.raw_user_meta_data
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE p_search IS NULL 
      OR p.first_name ILIKE '%' || p_search || '%'
      OR p.last_name ILIKE '%' || p_search || '%'
      OR u.email ILIKE '%' || p_search || '%'
  )
  SELECT 
    ARRAY_AGG(u.*) as users,
    COUNT(*) OVER() as total_count
  FROM filtered_users u
  ORDER BY u.created_at DESC
  LIMIT p_limit
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user details (admin only)
CREATE OR REPLACE FUNCTION admin_get_user_details(p_user_id UUID)
RETURNS TABLE (
  user_info profiles,
  orders_count BIGINT,
  total_spent DECIMAL(10, 2)
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view user details';
  END IF;

  RETURN QUERY
  SELECT 
    p.*,
    COUNT(o.id) as orders_count,
    COALESCE(SUM(o.total), 0) as total_spent
  FROM profiles p
  LEFT JOIN orders o ON o.user_id = p.id
  WHERE p.id = p_user_id
  GROUP BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role (admin only)
CREATE OR REPLACE FUNCTION admin_update_user_role(
  p_user_id UUID,
  p_role TEXT
) RETURNS auth.users AS $$
DECLARE
  v_user auth.users;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update user roles';
  END IF;

  -- Validate role
  IF p_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Update user role
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || 
    jsonb_build_object('role', p_role)
  WHERE id = p_user_id
  RETURNING * INTO v_user;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 