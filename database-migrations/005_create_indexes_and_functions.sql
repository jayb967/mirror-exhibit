-- Additional indexes and utility functions for brands and tags functionality
-- This file creates performance optimizations and helper functions

-- ============================================================================
-- ADDITIONAL PERFORMANCE INDEXES
-- ============================================================================

-- Composite indexes for common filtering scenarios
CREATE INDEX IF NOT EXISTS idx_products_brand_category ON products(brand_id, category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_brand_featured ON products(brand_id, is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_category_featured ON products(category_id, is_featured) WHERE is_active = true;

-- Text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_brands_name_search ON brands USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_tags_name_search ON tags USING gin(to_tsvector('english', name));

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get products by multiple tags (AND logic)
CREATE OR REPLACE FUNCTION get_products_with_all_tags(tag_ids UUID[])
RETURNS TABLE(product_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT pt.product_id
  FROM product_tags pt
  WHERE pt.tag_id = ANY(tag_ids)
  GROUP BY pt.product_id
  HAVING COUNT(DISTINCT pt.tag_id) = array_length(tag_ids, 1);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_products_with_all_tags IS 'Returns products that have ALL specified tags';

-- Function to get products by any tags (OR logic)
CREATE OR REPLACE FUNCTION get_products_with_any_tags(tag_ids UUID[])
RETURNS TABLE(product_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT pt.product_id
  FROM product_tags pt
  WHERE pt.tag_id = ANY(tag_ids);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_products_with_any_tags IS 'Returns products that have ANY of the specified tags';

-- Function to search products by text across multiple fields
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE(
  product_id UUID,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    (
      ts_rank(to_tsvector('english', p.name), plainto_tsquery('english', search_term)) * 3 +
      ts_rank(to_tsvector('english', COALESCE(p.description, '')), plainto_tsquery('english', search_term)) * 2 +
      ts_rank(to_tsvector('english', COALESCE(b.name, '')), plainto_tsquery('english', search_term)) * 2 +
      ts_rank(to_tsvector('english', COALESCE(string_agg(t.name, ' '), '')), plainto_tsquery('english', search_term)) * 1
    ) as relevance_score
  FROM products p
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN product_tags pt ON p.id = pt.product_id
  LEFT JOIN tags t ON pt.tag_id = t.id
  WHERE 
    p.is_active = true AND
    (
      to_tsvector('english', p.name) @@ plainto_tsquery('english', search_term) OR
      to_tsvector('english', COALESCE(p.description, '')) @@ plainto_tsquery('english', search_term) OR
      to_tsvector('english', COALESCE(b.name, '')) @@ plainto_tsquery('english', search_term) OR
      to_tsvector('english', COALESCE(t.name, '')) @@ plainto_tsquery('english', search_term)
    )
  GROUP BY p.id, p.name, p.description, b.name
  ORDER BY relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_products IS 'Full-text search across products, brands, and tags with relevance scoring';

-- Function to get tag suggestions based on partial input
CREATE OR REPLACE FUNCTION get_tag_suggestions(partial_name TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  tag_id UUID,
  tag_name VARCHAR(50),
  tag_category VARCHAR(20),
  tag_color VARCHAR(7),
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.category,
    t.color,
    COUNT(pt.product_id) as product_count
  FROM tags t
  LEFT JOIN product_tags pt ON t.id = pt.tag_id
  LEFT JOIN products p ON pt.product_id = p.id AND p.is_active = true
  WHERE 
    t.is_active = true AND
    t.name ILIKE '%' || partial_name || '%'
  GROUP BY t.id, t.name, t.category, t.color
  ORDER BY product_count DESC, t.name
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_tag_suggestions IS 'Get tag suggestions based on partial name match';

-- Function to get brand suggestions based on partial input
CREATE OR REPLACE FUNCTION get_brand_suggestions(partial_name TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  brand_id UUID,
  brand_name VARCHAR(100),
  brand_slug VARCHAR(100),
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.slug,
    COUNT(p.id) as product_count
  FROM brands b
  LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = true
  WHERE 
    b.is_active = true AND
    b.name ILIKE '%' || partial_name || '%'
  GROUP BY b.id, b.name, b.slug
  ORDER BY product_count DESC, b.name
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_brand_suggestions IS 'Get brand suggestions based on partial name match';

-- ============================================================================
-- DATA VALIDATION FUNCTIONS
-- ============================================================================

-- Function to validate hex color codes
CREATE OR REPLACE FUNCTION is_valid_hex_color(color_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN color_code ~ '^#[0-9A-Fa-f]{6}$';
END;
$$ LANGUAGE plpgsql;

-- Add check constraint for tag colors
ALTER TABLE tags 
ADD CONSTRAINT check_valid_hex_color 
CHECK (is_valid_hex_color(color));

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(trim(input_name), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_slug IS 'Generate URL-friendly slug from name';
