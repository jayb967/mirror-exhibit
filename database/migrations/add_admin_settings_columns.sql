-- Create site_settings table for admin configuration
-- This migration creates the table if it doesn't exist and adds all necessary columns

-- Create site_settings table with all required columns
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Shipping settings
  free_shipping_threshold DECIMAL(10,2) DEFAULT 100.00,
  origin_address JSONB,
  easyship_enabled BOOLEAN DEFAULT true,

  -- Default package settings for Easyship
  default_package_weight DECIMAL(8,2) DEFAULT 2.0,
  default_package_weight_unit TEXT DEFAULT 'lb',
  default_package_length DECIMAL(8,2) DEFAULT 12.0,
  default_package_width DECIMAL(8,2) DEFAULT 12.0,
  default_package_height DECIMAL(8,2) DEFAULT 4.0,
  default_package_dimension_unit TEXT DEFAULT 'in',

  -- Tax settings
  tax_enabled BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5,4) DEFAULT 0.0875, -- Default 8.75%

  -- Payment method settings
  stripe_enabled BOOLEAN DEFAULT true,
  paypal_enabled BOOLEAN DEFAULT false,
  apple_pay_enabled BOOLEAN DEFAULT false,
  google_pay_enabled BOOLEAN DEFAULT false,

  -- Store information
  store_name TEXT DEFAULT 'Mirror Exhibit',
  store_email TEXT DEFAULT 'info@mirrorexhibit.com',
  store_phone TEXT DEFAULT '555-123-4567',
  order_notification_email TEXT DEFAULT 'orders@mirrorexhibit.com',
  low_stock_threshold INTEGER DEFAULT 5,

  -- SEO settings
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,

  -- Social media
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and create it
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if no row exists
INSERT INTO site_settings (
  tax_enabled,
  tax_rate,
  stripe_enabled,
  paypal_enabled,
  apple_pay_enabled,
  google_pay_enabled,
  store_name,
  store_email,
  store_phone,
  order_notification_email,
  low_stock_threshold,
  free_shipping_threshold,
  easyship_enabled,
  default_package_weight,
  default_package_weight_unit,
  default_package_length,
  default_package_width,
  default_package_height,
  default_package_dimension_unit,
  origin_address
)
SELECT
  true,
  0.0875,
  true,
  false,
  false,
  false,
  'Mirror Exhibit',
  'info@mirrorexhibit.com',
  '555-123-4567',
  'orders@mirrorexhibit.com',
  5,
  100.00,
  true,
  2.0,
  'lb',
  12.0,
  12.0,
  4.0,
  'in',
  jsonb_build_object(
    'name', 'Mirror Exhibit',
    'company', 'Mirror Exhibit',
    'address', '123 Main St',
    'address2', '',
    'city', 'New York',
    'state', 'NY',
    'postalCode', '10001',
    'country', 'US',
    'phone', '555-123-4567',
    'email', 'shipping@mirrorexhibit.com'
  )
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- Enable Row Level Security (optional, for better security)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can make this more restrictive)
CREATE POLICY "Allow all operations on site_settings" ON site_settings
  FOR ALL USING (true) WITH CHECK (true);
