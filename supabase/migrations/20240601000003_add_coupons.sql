-- Create coupons table if it doesn't exist
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookup of coupon codes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Create index for active coupons
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active) WHERE is_active = true;

-- Create index for expired coupons
CREATE INDEX IF NOT EXISTS idx_coupons_expired ON coupons(expires_at) WHERE expires_at IS NOT NULL;

-- Add coupon_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Create function to increment coupon usage
CREATE OR REPLACE FUNCTION increment(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_value INTEGER;
BEGIN
  SELECT current_uses INTO current_value FROM coupons WHERE id = row_id;
  RETURN current_value + 1;
END;
$$ LANGUAGE plpgsql;

-- Insert sample coupons
INSERT INTO coupons (
  code,
  description,
  discount_type,
  discount_value,
  min_purchase,
  starts_at,
  expires_at,
  max_uses,
  is_active
) VALUES 
(
  'WELCOME10',
  'Welcome discount - 10% off your first order',
  'percentage',
  10,
  0,
  now(),
  now() + interval '30 days',
  NULL,
  true
),
(
  'SUMMER20',
  'Summer sale - 20% off orders over $50',
  'percentage',
  20,
  50,
  now(),
  now() + interval '60 days',
  1000,
  true
),
(
  'FREESHIP',
  'Free shipping on orders over $75',
  'fixed',
  5.99,
  75,
  now(),
  now() + interval '90 days',
  NULL,
  true
)
ON CONFLICT (code) DO NOTHING;
