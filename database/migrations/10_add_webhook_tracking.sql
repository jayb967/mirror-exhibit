-- Add webhook tracking to orders table
-- This helps track when webhooks have processed additional payment data

DO $$
BEGIN
    -- Add webhook_processed_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'webhook_processed_at') THEN
        ALTER TABLE orders ADD COLUMN webhook_processed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add index for webhook tracking
    CREATE INDEX IF NOT EXISTS idx_orders_webhook_processed 
    ON orders(webhook_processed_at);
    
    -- Add index for stripe_session_id lookups (if not exists)
    CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id 
    ON orders(stripe_session_id);
    
END $$;

-- Add comment
COMMENT ON COLUMN orders.webhook_processed_at IS 'Timestamp when Stripe webhook processed additional payment data for this order';
