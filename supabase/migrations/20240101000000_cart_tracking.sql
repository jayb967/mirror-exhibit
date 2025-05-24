-- Create cart_tracking table
CREATE TABLE IF NOT EXISTS cart_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_token TEXT,
  email TEXT,
  cart_items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
  checkout_started BOOLEAN DEFAULT false,
  checkout_completed BOOLEAN DEFAULT false,
  recovery_email_sent BOOLEAN DEFAULT false,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT,
  browser TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT cart_tracking_user_or_guest CHECK (
    (user_id IS NOT NULL) OR (guest_token IS NOT NULL) OR (email IS NOT NULL)
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS cart_tracking_user_id_idx ON cart_tracking(user_id);
CREATE INDEX IF NOT EXISTS cart_tracking_guest_token_idx ON cart_tracking(guest_token);
CREATE INDEX IF NOT EXISTS cart_tracking_email_idx ON cart_tracking(email);
CREATE INDEX IF NOT EXISTS cart_tracking_last_activity_idx ON cart_tracking(last_activity);
CREATE INDEX IF NOT EXISTS cart_tracking_checkout_idx ON cart_tracking(checkout_started, checkout_completed);

-- Add RLS policies
ALTER TABLE cart_tracking ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own cart tracking data
CREATE POLICY cart_tracking_select_user ON cart_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own cart tracking data
CREATE POLICY cart_tracking_insert_user ON cart_tracking
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

-- Policy for users to update their own cart tracking data
CREATE POLICY cart_tracking_update_user ON cart_tracking
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND guest_token IS NOT NULL)
  );

-- Function to get abandoned carts for marketing
CREATE OR REPLACE FUNCTION get_abandoned_carts(
  p_hours_threshold INTEGER DEFAULT 24,
  p_limit INTEGER DEFAULT 100
)
RETURNS SETOF cart_tracking AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM cart_tracking
  WHERE 
    checkout_started = true AND
    checkout_completed = false AND
    recovery_email_sent = false AND
    email IS NOT NULL AND
    last_activity < (now() - (p_hours_threshold || ' hours')::interval)
  ORDER BY last_activity DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark recovery email as sent
CREATE OR REPLACE FUNCTION mark_recovery_email_sent(
  p_tracking_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  UPDATE cart_tracking
  SET 
    recovery_email_sent = true,
    updated_at = now()
  WHERE id = p_tracking_id;
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cart analytics for admin
CREATE OR REPLACE FUNCTION admin_get_cart_analytics(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  total_carts BIGINT,
  abandoned_carts BIGINT,
  completed_carts BIGINT,
  recovery_rate NUMERIC
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view analytics';
  END IF;

  RETURN QUERY
  WITH daily_stats AS (
    SELECT
      DATE(created_at) as day,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE checkout_started = true AND checkout_completed = false) as abandoned,
      COUNT(*) FILTER (WHERE checkout_completed = true) as completed,
      COUNT(*) FILTER (WHERE recovery_email_sent = true AND checkout_completed = true) as recovered
    FROM cart_tracking
    WHERE created_at >= (now() - (p_days || ' days')::interval)
    GROUP BY day
  )
  SELECT
    day as date,
    total as total_carts,
    abandoned as abandoned_carts,
    completed as completed_carts,
    CASE 
      WHEN recovered = 0 THEN 0
      ELSE (recovered::numeric / NULLIF(abandoned, 0)) * 100
    END as recovery_rate
  FROM daily_stats
  ORDER BY day DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
