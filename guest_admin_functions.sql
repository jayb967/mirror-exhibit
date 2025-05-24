-- Function to get guest users with statistics (cart items count and orders count)
CREATE OR REPLACE FUNCTION public.get_guest_users_with_stats()
RETURNS TABLE (
  id UUID,
  guest_token TEXT,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  apartment TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  cart_items_count BIGINT,
  orders_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gu.id,
    gu.guest_token,
    gu.email,
    gu.first_name,
    gu.last_name,
    gu.address,
    gu.apartment,
    gu.city,
    gu.state,
    gu.postal_code,
    gu.country,
    gu.phone,
    gu.created_at,
    gu.updated_at,
    COALESCE(cart_count.count, 0) AS cart_items_count,
    COALESCE(order_count.count, 0) AS orders_count
  FROM 
    public.guest_users gu
  LEFT JOIN (
    SELECT 
      guest_token, 
      COUNT(*) AS count
    FROM 
      public.guest_cart_items
    GROUP BY 
      guest_token
  ) cart_count ON gu.guest_token = cart_count.guest_token
  LEFT JOIN (
    SELECT 
      guest_token, 
      COUNT(*) AS count
    FROM 
      public.orders
    WHERE 
      guest_token IS NOT NULL
    GROUP BY 
      guest_token
  ) order_count ON gu.guest_token = order_count.guest_token
  ORDER BY 
    gu.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get guest statistics
CREATE OR REPLACE FUNCTION public.get_guest_stats()
RETURNS TABLE (
  total_guests BIGINT,
  guests_with_orders BIGINT,
  conversion_rate NUMERIC,
  abandoned_carts BIGINT,
  average_cart_value NUMERIC
) AS $$
DECLARE
  v_total_guests BIGINT;
  v_guests_with_orders BIGINT;
  v_conversion_rate NUMERIC;
  v_abandoned_carts BIGINT;
  v_average_cart_value NUMERIC;
BEGIN
  -- Get total number of guest users
  SELECT COUNT(*) INTO v_total_guests
  FROM public.guest_users;
  
  -- Get number of guest users with orders
  SELECT COUNT(DISTINCT guest_token) INTO v_guests_with_orders
  FROM public.orders
  WHERE guest_token IS NOT NULL;
  
  -- Calculate conversion rate
  IF v_total_guests > 0 THEN
    v_conversion_rate := v_guests_with_orders::NUMERIC / v_total_guests::NUMERIC;
  ELSE
    v_conversion_rate := 0;
  END IF;
  
  -- Get number of abandoned carts (guests with cart items but no orders)
  SELECT COUNT(*) INTO v_abandoned_carts
  FROM public.guest_users gu
  WHERE EXISTS (
    SELECT 1 FROM public.guest_cart_items gci
    WHERE gci.guest_token = gu.guest_token
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.guest_token = gu.guest_token
  );
  
  -- Calculate average cart value
  SELECT AVG(cart_value) INTO v_average_cart_value
  FROM (
    SELECT 
      gci.guest_token,
      SUM(p.base_price * gci.quantity) AS cart_value
    FROM 
      public.guest_cart_items gci
    JOIN 
      public.products p ON gci.product_id = p.id
    GROUP BY 
      gci.guest_token
  ) AS cart_values;
  
  -- Return the statistics
  RETURN QUERY SELECT 
    v_total_guests,
    v_guests_with_orders,
    v_conversion_rate,
    v_abandoned_carts,
    COALESCE(v_average_cart_value, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
