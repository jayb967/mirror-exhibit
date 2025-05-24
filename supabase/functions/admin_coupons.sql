-- Function to create a coupon (admin only)
CREATE OR REPLACE FUNCTION admin_create_coupon(
  p_code TEXT,
  p_description TEXT,
  p_discount_type TEXT,
  p_discount_value DECIMAL(10, 2),
  p_min_purchase DECIMAL(10, 2),
  p_starts_at TIMESTAMP WITH TIME ZONE,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_max_uses INTEGER
) RETURNS coupons AS $$
DECLARE
  v_coupon coupons;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create coupons';
  END IF;

  -- Validate discount type
  IF p_discount_type NOT IN ('percentage', 'fixed') THEN
    RAISE EXCEPTION 'Invalid discount type';
  END IF;

  -- Validate discount value
  IF p_discount_type = 'percentage' AND (p_discount_value <= 0 OR p_discount_value > 100) THEN
    RAISE EXCEPTION 'Percentage discount must be between 0 and 100';
  END IF;

  IF p_discount_type = 'fixed' AND p_discount_value <= 0 THEN
    RAISE EXCEPTION 'Fixed discount must be greater than 0';
  END IF;

  -- Insert the coupon
  INSERT INTO coupons (
    code, description, discount_type, discount_value,
    min_purchase, starts_at, expires_at, max_uses
  ) VALUES (
    p_code, p_description, p_discount_type, p_discount_value,
    p_min_purchase, p_starts_at, p_expires_at, p_max_uses
  ) RETURNING * INTO v_coupon;

  RETURN v_coupon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a coupon (admin only)
CREATE OR REPLACE FUNCTION admin_update_coupon(
  p_id UUID,
  p_code TEXT,
  p_description TEXT,
  p_discount_type TEXT,
  p_discount_value DECIMAL(10, 2),
  p_min_purchase DECIMAL(10, 2),
  p_starts_at TIMESTAMP WITH TIME ZONE,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_max_uses INTEGER,
  p_is_active BOOLEAN
) RETURNS coupons AS $$
DECLARE
  v_coupon coupons;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update coupons';
  END IF;

  -- Validate discount type if provided
  IF p_discount_type IS NOT NULL AND p_discount_type NOT IN ('percentage', 'fixed') THEN
    RAISE EXCEPTION 'Invalid discount type';
  END IF;

  -- Validate discount value if provided
  IF p_discount_type = 'percentage' AND (p_discount_value <= 0 OR p_discount_value > 100) THEN
    RAISE EXCEPTION 'Percentage discount must be between 0 and 100';
  END IF;

  IF p_discount_type = 'fixed' AND p_discount_value <= 0 THEN
    RAISE EXCEPTION 'Fixed discount must be greater than 0';
  END IF;

  -- Update the coupon
  UPDATE coupons
  SET
    code = COALESCE(p_code, code),
    description = COALESCE(p_description, description),
    discount_type = COALESCE(p_discount_type, discount_type),
    discount_value = COALESCE(p_discount_value, discount_value),
    min_purchase = COALESCE(p_min_purchase, min_purchase),
    starts_at = COALESCE(p_starts_at, starts_at),
    expires_at = COALESCE(p_expires_at, expires_at),
    max_uses = COALESCE(p_max_uses, max_uses),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_coupon;

  IF v_coupon IS NULL THEN
    RAISE EXCEPTION 'Coupon not found';
  END IF;

  RETURN v_coupon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a coupon (admin only)
CREATE OR REPLACE FUNCTION admin_delete_coupon(p_id UUID)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete coupons';
  END IF;

  -- Delete the coupon
  DELETE FROM coupons WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all coupons with pagination (admin only)
CREATE OR REPLACE FUNCTION admin_get_coupons(
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 10,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  coupons coupons[],
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
    RAISE EXCEPTION 'Unauthorized: Only admins can view coupons';
  END IF;

  v_offset := (p_page - 1) * p_limit;

  RETURN QUERY
  WITH filtered_coupons AS (
    SELECT *
    FROM coupons
    WHERE p_is_active IS NULL OR is_active = p_is_active
  )
  SELECT 
    ARRAY_AGG(c.*) as coupons,
    COUNT(*) OVER() as total_count
  FROM filtered_coupons c
  ORDER BY c.created_at DESC
  LIMIT p_limit
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 