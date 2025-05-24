-- Add shipping-related fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'lb',
ADD COLUMN IF NOT EXISTS length DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS dimension_unit TEXT DEFAULT 'in';

-- Add shipping-related fields to product_variations table
ALTER TABLE product_variations
ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'lb',
ADD COLUMN IF NOT EXISTS length DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS dimension_unit TEXT DEFAULT 'in';

-- Add tracking information to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
ADD COLUMN IF NOT EXISTS courier_id TEXT,
ADD COLUMN IF NOT EXISTS courier_name TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;

-- Create shipping_rules table for free shipping thresholds and other rules
CREATE TABLE IF NOT EXISTS shipping_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL, -- 'threshold', 'product_specific', 'category_specific', etc.
  threshold_amount DECIMAL(10, 2), -- For threshold-based rules
  category_id UUID REFERENCES product_categories(id) ON DELETE CASCADE, -- For category-specific rules
  product_id UUID REFERENCES products(id) ON DELETE CASCADE, -- For product-specific rules
  country_codes TEXT[], -- Array of country codes this rule applies to
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE, -- NULL means no end date
  priority INTEGER DEFAULT 0, -- Higher number means higher priority
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookup of active shipping rules
CREATE INDEX IF NOT EXISTS idx_shipping_rules_active ON shipping_rules(is_active) WHERE is_active = true;

-- Create index for date-based rules
CREATE INDEX IF NOT EXISTS idx_shipping_rules_dates ON shipping_rules(start_date, end_date) 
WHERE start_date IS NOT NULL OR end_date IS NOT NULL;

-- Insert default free shipping threshold rule
INSERT INTO shipping_rules (
  name, 
  description, 
  rule_type, 
  threshold_amount, 
  is_active, 
  priority
)
VALUES (
  'Free Standard Shipping on Orders Over $100',
  'Orders with subtotal over $100 qualify for free standard shipping',
  'threshold',
  100.00,
  true,
  10
)
ON CONFLICT DO NOTHING;
