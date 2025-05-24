-- =====================================================
-- Product Analytics Database Setup
-- =====================================================
-- This script creates the product analytics infrastructure
-- for tracking user interactions with products
-- 
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create the product_analytics table
-- =====================================================
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous users
  session_id TEXT, -- For anonymous user tracking (generated client-side)
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view', 
    'add_to_cart_click', 
    'option_select', 
    'modal_open', 
    'modal_close',
    'carousel_interaction',
    'purchase',
    'product_click'
  )),
  event_data JSONB DEFAULT '{}', -- Store additional data like selected options, quantities, etc.
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  source TEXT, -- 'home_carousel', 'product_page', 'search', 'category', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for optimal performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_event_type ON product_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_product_analytics_created_at ON product_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_product_analytics_session_id ON product_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_user_id ON product_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_source ON product_analytics(source);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_event ON product_analytics(product_id, event_type);
CREATE INDEX IF NOT EXISTS idx_product_analytics_recent_views ON product_analytics(event_type, created_at) WHERE event_type = 'view';

-- 3. Create materialized view for product view counts
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS product_view_counts AS
SELECT 
  product_id,
  COUNT(*) as total_views,
  COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_views,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as views_last_7_days,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
  MAX(created_at) as last_viewed_at
FROM product_analytics 
WHERE event_type = 'view'
GROUP BY product_id;

-- Create unique index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_view_counts_product_id ON product_view_counts(product_id);

-- 4. Create materialized view for product popularity (includes all engagement)
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS product_popularity_scores AS
SELECT 
  p.product_id,
  -- Weighted scoring system
  (
    COALESCE(views.total_views, 0) * 1.0 +
    COALESCE(cart_adds.total_cart_adds, 0) * 5.0 +
    COALESCE(modal_opens.total_modal_opens, 0) * 2.0
  ) as popularity_score,
  COALESCE(views.total_views, 0) as total_views,
  COALESCE(cart_adds.total_cart_adds, 0) as total_cart_adds,
  COALESCE(modal_opens.total_modal_opens, 0) as total_modal_opens,
  GREATEST(
    COALESCE(views.last_activity, '1970-01-01'::timestamp),
    COALESCE(cart_adds.last_activity, '1970-01-01'::timestamp),
    COALESCE(modal_opens.last_activity, '1970-01-01'::timestamp)
  ) as last_activity
FROM (
  SELECT DISTINCT product_id FROM product_analytics
) p
LEFT JOIN (
  SELECT 
    product_id,
    COUNT(*) as total_views,
    MAX(created_at) as last_activity
  FROM product_analytics 
  WHERE event_type = 'view'
  GROUP BY product_id
) views ON p.product_id = views.product_id
LEFT JOIN (
  SELECT 
    product_id,
    COUNT(*) as total_cart_adds,
    MAX(created_at) as last_activity
  FROM product_analytics 
  WHERE event_type = 'add_to_cart_click'
  GROUP BY product_id
) cart_adds ON p.product_id = cart_adds.product_id
LEFT JOIN (
  SELECT 
    product_id,
    COUNT(*) as total_modal_opens,
    MAX(created_at) as last_activity
  FROM product_analytics 
  WHERE event_type = 'modal_open'
  GROUP BY product_id
) modal_opens ON p.product_id = modal_opens.product_id;

-- Create index on the popularity materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_popularity_scores_product_id ON product_popularity_scores(product_id);
CREATE INDEX IF NOT EXISTS idx_product_popularity_scores_score ON product_popularity_scores(popularity_score DESC);

-- 5. Create function to refresh materialized views
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_product_analytics_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_view_counts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_popularity_scores;
END;
$$;

-- 6. Add view_count column to products table (for quick access)
-- =====================================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index on view_count for sorting
CREATE INDEX IF NOT EXISTS idx_products_view_count ON products(view_count DESC);

-- 7. Create function to update product view_count
-- =====================================================
CREATE OR REPLACE FUNCTION update_product_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update for view events
  IF NEW.event_type = 'view' THEN
    UPDATE products 
    SET view_count = (
      SELECT COUNT(*) 
      FROM product_analytics 
      WHERE product_id = NEW.product_id 
      AND event_type = 'view'
    )
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 8. Create trigger to automatically update view counts
-- =====================================================
DROP TRIGGER IF EXISTS trigger_update_product_view_count ON product_analytics;
CREATE TRIGGER trigger_update_product_view_count
  AFTER INSERT ON product_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_product_view_count();

-- 9. Enable Row Level Security (RLS) for analytics table
-- =====================================================
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for inserting analytics (anyone can track events)
CREATE POLICY "Anyone can insert analytics events" ON product_analytics
  FOR INSERT WITH CHECK (true);

-- Policy for reading analytics (only authenticated users can read)
CREATE POLICY "Authenticated users can read analytics" ON product_analytics
  FOR SELECT USING (auth.role() = 'authenticated');

-- 10. Create initial data migration (update existing products with view counts)
-- =====================================================
-- This will set view_count to 0 for all existing products
UPDATE products SET view_count = 0 WHERE view_count IS NULL;

-- 11. Comments for documentation
-- =====================================================
COMMENT ON TABLE product_analytics IS 'Tracks user interactions with products for analytics and recommendations';
COMMENT ON COLUMN product_analytics.event_type IS 'Type of event: view, add_to_cart_click, option_select, modal_open, modal_close, carousel_interaction, purchase, product_click';
COMMENT ON COLUMN product_analytics.event_data IS 'JSON data specific to the event type (e.g., selected options, position in carousel)';
COMMENT ON COLUMN product_analytics.source IS 'Where the event originated: home_carousel, product_page, search, category, etc.';
COMMENT ON COLUMN product_analytics.session_id IS 'Client-generated session ID for anonymous user tracking';

COMMENT ON MATERIALIZED VIEW product_view_counts IS 'Aggregated view counts per product with time-based breakdowns';
COMMENT ON MATERIALIZED VIEW product_popularity_scores IS 'Weighted popularity scores based on views, cart adds, and modal opens';

-- =====================================================
-- Setup Complete!
-- =====================================================
-- 
-- Next steps:
-- 1. Run this script in Supabase SQL Editor
-- 2. Verify tables and views were created successfully
-- 3. Test with sample data if needed
-- 
-- To refresh materialized views manually:
-- SELECT refresh_product_analytics_views();
-- 
-- To check if everything was created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%analytics%';
-- SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';
-- =====================================================
