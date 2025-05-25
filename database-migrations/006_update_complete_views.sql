-- Update the products_complete view to include tags after all tables are created
-- This file should be run after all other migrations

-- Drop and recreate the products_complete view with tags included
DROP VIEW IF EXISTS products_complete;

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
  CASE 
    WHEN b.id IS NOT NULL THEN
      json_build_object(
        'id', b.id,
        'name', b.name,
        'slug', b.slug,
        'description', b.description,
        'logo_url', b.logo_url,
        'website_url', b.website_url
      )
    ELSE NULL
  END as brand,
  
  -- Category information
  CASE 
    WHEN c.id IS NOT NULL THEN
      json_build_object(
        'id', c.id,
        'name', c.name
      )
    ELSE NULL
  END as category,
  
  -- Tags array
  COALESCE(
    array_agg(
      json_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'color', t.color,
        'category', t.category
      ) ORDER BY t.category, t.name
    ) FILTER (WHERE t.id IS NOT NULL),
    ARRAY[]::json[]
  ) as tags
  
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id AND b.is_active = true
LEFT JOIN product_categories c ON p.category_id = c.id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id AND t.is_active = true
GROUP BY p.id, p.name, p.description, p.base_price, p.image_url, p.is_featured, 
         p.is_active, p.category_id, p.meta_title, p.meta_description, p.meta_keywords,
         p.created_at, p.updated_at,
         b.id, b.name, b.slug, b.description, b.logo_url, b.website_url,
         c.id, c.name;

COMMENT ON VIEW products_complete IS 'Comprehensive view showing products with brands, categories, and tags';

-- Create a view for easy product search with all related data
CREATE OR REPLACE VIEW products_search_view AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.base_price,
  p.image_url,
  p.is_featured,
  p.is_active,
  p.meta_keywords,
  
  -- Brand name for search
  b.name as brand_name,
  
  -- Category name for search
  c.name as category_name,
  
  -- All tag names concatenated for search
  string_agg(DISTINCT t.name, ' ') as tag_names,
  
  -- Search text combining all searchable fields
  (
    COALESCE(p.name, '') || ' ' ||
    COALESCE(p.description, '') || ' ' ||
    COALESCE(p.meta_keywords, '') || ' ' ||
    COALESCE(b.name, '') || ' ' ||
    COALESCE(c.name, '') || ' ' ||
    COALESCE(string_agg(DISTINCT t.name, ' '), '')
  ) as search_text
  
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id AND b.is_active = true
LEFT JOIN product_categories c ON p.category_id = c.id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id AND t.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.name, p.description, p.base_price, p.image_url, p.is_featured, 
         p.is_active, p.meta_keywords, b.name, c.name;

COMMENT ON VIEW products_search_view IS 'Optimized view for product search functionality';

-- Create indexes on the search view for better performance
CREATE INDEX IF NOT EXISTS idx_products_search_text ON products USING gin(to_tsvector('english', 
  COALESCE(name, '') || ' ' || 
  COALESCE(description, '') || ' ' || 
  COALESCE(meta_keywords, '')
));

-- Update the search function to work with the new schema
CREATE OR REPLACE FUNCTION search_products_enhanced(search_term TEXT, limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
  product_id UUID,
  product_name TEXT,
  product_description TEXT,
  base_price DECIMAL(10,2),
  image_url TEXT,
  brand_name TEXT,
  category_name TEXT,
  tag_names TEXT,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    psv.id,
    psv.name,
    psv.description,
    psv.base_price,
    psv.image_url,
    psv.brand_name,
    psv.category_name,
    psv.tag_names,
    ts_rank(to_tsvector('english', psv.search_text), plainto_tsquery('english', search_term)) as relevance_score
  FROM products_search_view psv
  WHERE 
    psv.is_active = true AND
    to_tsvector('english', psv.search_text) @@ plainto_tsquery('english', search_term)
  ORDER BY relevance_score DESC, psv.name
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_products_enhanced IS 'Enhanced search function with brand and tag support';
