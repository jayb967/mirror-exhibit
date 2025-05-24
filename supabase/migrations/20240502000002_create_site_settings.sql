-- Create site_settings table for admin configuration
-- This table stores global settings that can be configured by admins

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Shipping settings
  free_shipping_threshold DECIMAL(10,2) DEFAULT 100.00,
  origin_address JSONB,
  
  -- Tax settings
  tax_rate DECIMAL(5,4) DEFAULT 0.0875, -- Default 8.75%
  tax_enabled BOOLEAN DEFAULT true,
  
  -- Store information
  store_name TEXT DEFAULT 'Mirror Exhibit',
  store_email TEXT,
  store_phone TEXT,
  
  -- Easyship settings
  easyship_enabled BOOLEAN DEFAULT true,
  default_package_weight DECIMAL(8,2) DEFAULT 2.0,
  default_package_weight_unit TEXT DEFAULT 'lb',
  default_package_length DECIMAL(8,2) DEFAULT 12.0,
  default_package_width DECIMAL(8,2) DEFAULT 12.0,
  default_package_height DECIMAL(8,2) DEFAULT 4.0,
  default_package_dimension_unit TEXT DEFAULT 'in',
  
  -- Payment settings
  stripe_enabled BOOLEAN DEFAULT true,
  paypal_enabled BOOLEAN DEFAULT false,
  apple_pay_enabled BOOLEAN DEFAULT false,
  google_pay_enabled BOOLEAN DEFAULT false,
  
  -- Notification settings
  order_notification_email TEXT,
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

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for site_settings
-- Anyone can read settings (for public features like free shipping threshold)
CREATE POLICY "Site settings can be read by anyone" 
ON site_settings FOR SELECT 
USING (true);

-- Only admins can insert/update settings
CREATE POLICY "Site settings can be inserted by admins" 
ON site_settings FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'publicMetadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'privateMetadata')::jsonb ->> 'role' = 'admin'
);

CREATE POLICY "Site settings can be updated by admins" 
ON site_settings FOR UPDATE 
TO authenticated
USING (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'publicMetadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'privateMetadata')::jsonb ->> 'role' = 'admin'
)
WITH CHECK (
  (auth.jwt() ->> 'app_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'publicMetadata')::jsonb ->> 'role' = 'admin' OR
  (auth.jwt() ->> 'privateMetadata')::jsonb ->> 'role' = 'admin'
);

-- Insert default settings
INSERT INTO site_settings (
  free_shipping_threshold,
  origin_address,
  tax_rate,
  tax_enabled,
  store_name,
  easyship_enabled,
  default_package_weight,
  default_package_weight_unit,
  default_package_length,
  default_package_width,
  default_package_height,
  default_package_dimension_unit,
  stripe_enabled,
  order_notification_email,
  low_stock_threshold
) VALUES (
  100.00,
  '{
    "name": "Mirror Exhibit",
    "company": "Mirror Exhibit",
    "address": "123 Main St",
    "address2": "",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US",
    "phone": "555-123-4567",
    "email": "orders@mirrorexhibit.com"
  }'::jsonb,
  0.0875,
  true,
  'Mirror Exhibit',
  true,
  2.0,
  'lb',
  12.0,
  12.0,
  4.0,
  'in',
  true,
  'admin@mirrorexhibit.com',
  5
) ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_created_at ON site_settings(created_at);
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON site_settings(updated_at);

-- Grant permissions
GRANT SELECT ON site_settings TO authenticated, anon;
GRANT INSERT, UPDATE ON site_settings TO authenticated;
