-- Update existing brands table for enhanced brand management
-- This table stores brand information like Rolex, BMW, etc.
-- Note: brands table already exists, we're just adding missing columns

-- Add missing columns to existing brands table
ALTER TABLE brands
ADD COLUMN IF NOT EXISTS slug VARCHAR(100),
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS created_by TEXT; -- Clerk user ID who created this brand

-- Create unique constraint on slug if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'brands_slug_key'
    AND table_name = 'brands'
  ) THEN
    ALTER TABLE brands ADD CONSTRAINT brands_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);
CREATE INDEX IF NOT EXISTS idx_brands_created_at ON brands(created_at);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_brands_updated_at();

-- Generate slugs for existing brands that don't have them
UPDATE brands
SET slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Insert some additional default brands to get started (only if they don't exist)
INSERT INTO brands (name, slug, description, is_active) VALUES
('Rolex', 'rolex', 'Luxury Swiss watch brand known for precision and prestige', true),
('BMW', 'bmw', 'German luxury automotive brand', true),
('Nike', 'nike', 'Global athletic footwear and apparel brand', true),
('Apple', 'apple', 'Technology company known for innovative products', true),
('Coca-Cola', 'coca-cola', 'Global beverage brand', true),
('Ferrari', 'ferrari', 'Italian luxury sports car manufacturer', true),
('Chanel', 'chanel', 'French luxury fashion house', true),
('Mercedes-Benz', 'mercedes-benz', 'German luxury automotive brand', true),
('Louis Vuitton', 'louis-vuitton', 'French luxury fashion house', true),
('Tesla', 'tesla', 'Electric vehicle and clean energy company', true)
ON CONFLICT (name) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE brands IS 'Stores brand information for products (e.g., Rolex, BMW, Nike)';
COMMENT ON COLUMN brands.name IS 'Brand display name';
COMMENT ON COLUMN brands.slug IS 'URL-friendly version of brand name';
COMMENT ON COLUMN brands.description IS 'Brand description or tagline';
COMMENT ON COLUMN brands.logo_url IS 'URL to brand logo image';
COMMENT ON COLUMN brands.website_url IS 'Official brand website URL';
COMMENT ON COLUMN brands.is_active IS 'Whether brand is active and visible';
COMMENT ON COLUMN brands.created_by IS 'Clerk user ID who created this brand';
