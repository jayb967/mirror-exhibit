-- Create product_tags junction table for many-to-many relationship
-- This table links products to their assigned tags

CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  assigned_by TEXT, -- Clerk user ID who assigned this tag
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_product_tags_product_id 
    FOREIGN KEY (product_id) 
    REFERENCES products(id) 
    ON DELETE CASCADE,
    
  CONSTRAINT fk_product_tags_tag_id 
    FOREIGN KEY (tag_id) 
    REFERENCES tags(id) 
    ON DELETE CASCADE,
    
  -- Ensure unique product-tag combinations
  CONSTRAINT unique_product_tag 
    UNIQUE(product_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag_id ON product_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_created_at ON product_tags(created_at);
CREATE INDEX IF NOT EXISTS idx_product_tags_assigned_by ON product_tags(assigned_by);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_product_tags_product_tag ON product_tags(product_id, tag_id);

-- Add comments for documentation
COMMENT ON TABLE product_tags IS 'Junction table linking products to their assigned tags';
COMMENT ON COLUMN product_tags.product_id IS 'Reference to products table';
COMMENT ON COLUMN product_tags.tag_id IS 'Reference to tags table';
COMMENT ON COLUMN product_tags.assigned_by IS 'Clerk user ID who assigned this tag to the product';
COMMENT ON COLUMN product_tags.created_at IS 'When this tag was assigned to the product';

-- Create a view for easy querying of products with their tags
CREATE OR REPLACE VIEW products_with_tags AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.base_price,
  p.image_url,
  p.is_featured,
  p.is_active,
  array_agg(
    json_build_object(
      'id', t.id,
      'name', t.name,
      'slug', t.slug,
      'color', t.color,
      'category', t.category
    ) ORDER BY t.name
  ) FILTER (WHERE t.id IS NOT NULL) as tags
FROM products p
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id AND t.is_active = true
GROUP BY p.id, p.name, p.base_price, p.image_url, p.is_featured, p.is_active;

COMMENT ON VIEW products_with_tags IS 'View showing products with their associated tags as JSON array';

-- Create a view for easy querying of tags with their product counts
CREATE OR REPLACE VIEW tags_with_product_counts AS
SELECT 
  t.id,
  t.name,
  t.slug,
  t.description,
  t.color,
  t.category,
  t.is_active,
  t.created_at,
  COUNT(pt.product_id) as product_count
FROM tags t
LEFT JOIN product_tags pt ON t.id = pt.tag_id
LEFT JOIN products p ON pt.product_id = p.id AND p.is_active = true
GROUP BY t.id, t.name, t.slug, t.description, t.color, t.category, t.is_active, t.created_at
ORDER BY t.category, t.name;

COMMENT ON VIEW tags_with_product_counts IS 'View showing tags with their product counts';
