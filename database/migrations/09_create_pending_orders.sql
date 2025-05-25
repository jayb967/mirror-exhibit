-- Create table to store pending order data before Stripe payment
-- This avoids Stripe's 500-character metadata limit

CREATE TABLE IF NOT EXISTS pending_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_session_id TEXT UNIQUE,
  order_data JSONB NOT NULL,
  items_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_orders_stripe_session ON pending_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_expires ON pending_orders(expires_at);

-- Add cleanup function to remove expired pending orders
CREATE OR REPLACE FUNCTION cleanup_expired_pending_orders()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM pending_orders 
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON pending_orders TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_pending_orders TO authenticated, anon;

-- Add comment
COMMENT ON TABLE pending_orders IS 'Temporary storage for order data before Stripe payment completion';
COMMENT ON FUNCTION cleanup_expired_pending_orders IS 'Removes expired pending orders (older than 24 hours)';
