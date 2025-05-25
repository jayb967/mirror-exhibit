-- Update products table brand relationship
-- Note: brand_id column already exists, we're just ensuring proper constraints and indexes

-- Ensure foreign key constraint exists (it might already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_products_brand_id'
    AND table_name = 'products'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT fk_products_brand_id
    FOREIGN KEY (brand_id)
    REFERENCES brands(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);

-- Add comment for documentation
COMMENT ON COLUMN products.brand_id IS 'Reference to brands table - which brand this product belongs to';

-- Create a view for easy querying of products with their brand information
CREATE OR REPLACE VIEW products_with_brands AS
SELECT
  p.id,
  p.name,
  p.description,
  p.base_price,
  p.image_url,
  p.is_featured,
  p.is_active,
  p.category_id,
  p.meta_title,
  p.meta_description,
  p.meta_keywords,
  p.created_at,
  p.updated_at,
  json_build_object(
    'id', b.id,
    'name', b.name,
    'slug', b.slug,
    'description', b.description,
    'logo_url', b.logo_url,
    'website_url', b.website_url
  ) as brand
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id AND b.is_active = true;

COMMENT ON VIEW products_with_brands IS 'View showing products with their brand information as JSON object';

-- Create a view for brands with their product counts
CREATE OR REPLACE VIEW brands_with_product_counts AS
SELECT
  b.id,
  b.name,
  b.slug,
  b.description,
  b.logo_url,
  b.website_url,
  b.is_active,
  b.created_at,
  COUNT(p.id) as product_count
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = true
GROUP BY b.id, b.name, b.slug, b.description, b.logo_url, b.website_url, b.is_active, b.created_at
ORDER BY b.name;

COMMENT ON VIEW brands_with_product_counts IS 'View showing brands with their product counts';

-- Create a comprehensive view combining products with both brands and tags
-- Note: This view will be created after tags tables are set up
CREATE OR REPLACE VIEW products_complete AS
SELECT
  p.id,
  p.name,
  p.description,
  p.base_price,
  p.image_url,
  p.is_featured,
  p.is_active,
  p.category_id,
  p.meta_title,
  p.meta_description,
  p.meta_keywords,
  p.created_at,
  p.updated_at,

  -- Brand information
  json_build_object(
    'id', b.id,
    'name', b.name,
    'slug', b.slug,
    'description', b.description,
    'logo_url', b.logo_url,
    'website_url', b.website_url
  ) as brand,

  -- Category information
  json_build_object(
    'id', c.id,
    'name', c.name
  ) as category

FROM products p
LEFT JOIN brands b ON p.brand_id = b.id AND b.is_active = true
LEFT JOIN product_categories c ON p.category_id = c.id;

COMMENT ON VIEW products_complete IS 'Comprehensive view showing products with brands, categories, and tags';
