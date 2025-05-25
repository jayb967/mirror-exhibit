-- Add coupon fields to orders table
-- This migration adds coupon support to the orders table

-- Add coupon-related columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS coupon_discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_discount_type TEXT CHECK (coupon_discount_type IN ('percentage', 'fixed'));

-- Add index for faster coupon lookups
CREATE INDEX IF NOT EXISTS idx_orders_coupon_id ON orders(coupon_id);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);

-- Add comments for documentation
COMMENT ON COLUMN orders.coupon_id IS 'Reference to the coupon used for this order';
COMMENT ON COLUMN orders.coupon_code IS 'Coupon code used (stored for historical reference)';
COMMENT ON COLUMN orders.coupon_discount_amount IS 'Actual discount amount applied from the coupon';
COMMENT ON COLUMN orders.coupon_discount_type IS 'Type of discount: percentage or fixed amount';

-- Update existing orders to have 0 coupon discount if null
UPDATE orders
SET coupon_discount_amount = 0
WHERE coupon_discount_amount IS NULL;

-- Make coupon_discount_amount NOT NULL with default 0
ALTER TABLE orders
ALTER COLUMN coupon_discount_amount SET NOT NULL,
ALTER COLUMN coupon_discount_amount SET DEFAULT 0;

-- Create function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE coupons
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_coupon_usage(UUID) TO authenticated, anon;
