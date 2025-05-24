-- Function to update order status (admin only)
CREATE OR REPLACE FUNCTION admin_update_order_status(
  p_order_id UUID,
  p_status TEXT
) RETURNS orders AS $$
DECLARE
  v_order orders;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update order status';
  END IF;

  -- Validate status
  IF p_status NOT IN ('pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'canceled', 'refunded', 'failed') THEN
    RAISE EXCEPTION 'Invalid order status';
  END IF;

  -- Update the order status
  UPDATE orders
  SET
    status = p_status,
    updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order details with items (admin only)
CREATE OR REPLACE FUNCTION admin_get_order_details(p_order_id UUID)
RETURNS TABLE (
  order_info orders,
  items order_items[],
  customer_info profiles
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view order details';
  END IF;

  RETURN QUERY
  SELECT 
    o.*,
    ARRAY_AGG(oi.*) as items,
    p.*
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN profiles p ON p.id = o.user_id
  WHERE o.id = p_order_id
  GROUP BY o.id, p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all orders with pagination (admin only)
CREATE OR REPLACE FUNCTION admin_get_orders(
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 10,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  orders orders[],
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
    RAISE EXCEPTION 'Unauthorized: Only admins can view orders';
  END IF;

  v_offset := (p_page - 1) * p_limit;

  RETURN QUERY
  WITH filtered_orders AS (
    SELECT *
    FROM orders
    WHERE p_status IS NULL OR status = p_status
  )
  SELECT 
    ARRAY_AGG(o.*) as orders,
    COUNT(*) OVER() as total_count
  FROM filtered_orders o
  ORDER BY o.created_at DESC
  LIMIT p_limit
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 