-- Fix missing columns in orders table
-- Add all columns that the order creation API expects

DO $$
BEGIN
    -- Add paid_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'paid_at') THEN
        ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add payment_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
        ALTER TABLE orders ADD COLUMN payment_status TEXT;
    END IF;
    
    -- Add stripe_payment_intent_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'stripe_payment_intent_id') THEN
        ALTER TABLE orders ADD COLUMN stripe_payment_intent_id TEXT;
    END IF;
    
    -- Add webhook_processed_at column if it doesn't exist (from previous migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'webhook_processed_at') THEN
        ALTER TABLE orders ADD COLUMN webhook_processed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add coupon-related columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'coupon_id') THEN
        ALTER TABLE orders ADD COLUMN coupon_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'coupon_code') THEN
        ALTER TABLE orders ADD COLUMN coupon_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'coupon_discount_amount') THEN
        ALTER TABLE orders ADD COLUMN coupon_discount_amount DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'coupon_discount_type') THEN
        ALTER TABLE orders ADD COLUMN coupon_discount_type TEXT;
    END IF;
    
    -- Add other commonly needed columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'tax_rate') THEN
        ALTER TABLE orders ADD COLUMN tax_rate DECIMAL(5,4);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_method') THEN
        ALTER TABLE orders ADD COLUMN shipping_method JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'stripe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE orders ADD COLUMN notes TEXT;
    END IF;
    
    -- Ensure user_id is TEXT type for Clerk compatibility
    DO $inner$
    DECLARE
        user_id_type TEXT;
    BEGIN
        SELECT data_type INTO user_id_type
        FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'user_id';
        
        IF user_id_type = 'uuid' THEN
            ALTER TABLE orders ALTER COLUMN user_id TYPE TEXT;
            RAISE NOTICE 'Changed orders.user_id from UUID to TEXT for Clerk compatibility';
        END IF;
    END $inner$;
    
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_paid_at ON orders(paid_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id);

-- Add comments for documentation
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was completed';
COMMENT ON COLUMN orders.payment_status IS 'Status of payment (pending, completed, failed, etc.)';
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe Payment Intent ID for this order';
COMMENT ON COLUMN orders.webhook_processed_at IS 'Timestamp when Stripe webhook processed additional payment data';
COMMENT ON COLUMN orders.coupon_id IS 'ID of coupon applied to this order';
COMMENT ON COLUMN orders.coupon_code IS 'Coupon code applied to this order';
COMMENT ON COLUMN orders.coupon_discount_amount IS 'Discount amount from coupon';
COMMENT ON COLUMN orders.coupon_discount_type IS 'Type of coupon discount (percentage, fixed)';

-- Success message
SELECT 'Orders table updated successfully with all required columns' as result;
