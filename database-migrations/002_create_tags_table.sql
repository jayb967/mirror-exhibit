-- Create tags table for product tag management
-- This table stores tags like fashion, humor, motivation, luxury, etc.

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#000000', -- Hex color code for UI display
  category VARCHAR(20) DEFAULT 'theme', -- fashion, emotion, style, theme, etc.
  is_active BOOLEAN DEFAULT true,
  created_by TEXT, -- Clerk user ID who created this tag
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_is_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tags_updated_at();

-- Insert default tags organized by category
INSERT INTO tags (name, slug, description, color, category, is_active) VALUES
-- Fashion tags
('Luxury', 'luxury', 'High-end, premium products', '#FFD700', 'fashion', true),
('Vintage', 'vintage', 'Classic, retro style', '#8B4513', 'fashion', true),
('Modern', 'modern', 'Contemporary, current style', '#2F4F4F', 'fashion', true),
('Minimalist', 'minimalist', 'Simple, clean design', '#708090', 'fashion', true),
('Elegant', 'elegant', 'Sophisticated and refined', '#4B0082', 'fashion', true),

-- Emotion tags
('Motivation', 'motivation', 'Inspiring and encouraging', '#FF6347', 'emotion', true),
('Humor', 'humor', 'Funny and entertaining', '#32CD32', 'emotion', true),
('Inspiration', 'inspiration', 'Uplifting and motivating', '#FF69B4', 'emotion', true),
('Calm', 'calm', 'Peaceful and relaxing', '#87CEEB', 'emotion', true),
('Energy', 'energy', 'Dynamic and energetic', '#FF4500', 'emotion', true),

-- Style tags
('Bold', 'bold', 'Strong and striking', '#DC143C', 'style', true),
('Subtle', 'subtle', 'Understated and refined', '#D3D3D3', 'style', true),
('Artistic', 'artistic', 'Creative and expressive', '#9370DB', 'style', true),
('Professional', 'professional', 'Business and formal', '#2F4F4F', 'style', true),
('Casual', 'casual', 'Relaxed and informal', '#20B2AA', 'style', true),

-- Theme tags
('Sports', 'sports', 'Athletic and competitive', '#228B22', 'theme', true),
('Cars', 'cars', 'Automotive themed', '#FF8C00', 'theme', true),
('Nature', 'nature', 'Natural and organic', '#8FBC8F', 'theme', true),
('Technology', 'technology', 'Tech and innovation', '#4169E1', 'theme', true),
('Travel', 'travel', 'Adventure and exploration', '#DAA520', 'theme', true),
('Music', 'music', 'Musical and rhythmic', '#9932CC', 'theme', true),
('Art', 'art', 'Artistic and creative', '#FF1493', 'theme', true),
('Fashion', 'fashion', 'Style and trends', '#FF69B4', 'theme', true)
ON CONFLICT (name) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE tags IS 'Stores tag information for products (e.g., luxury, motivation, sports)';
COMMENT ON COLUMN tags.name IS 'Tag display name';
COMMENT ON COLUMN tags.slug IS 'URL-friendly version of tag name';
COMMENT ON COLUMN tags.description IS 'Tag description or meaning';
COMMENT ON COLUMN tags.color IS 'Hex color code for UI display (#RRGGBB)';
COMMENT ON COLUMN tags.category IS 'Tag category: fashion, emotion, style, theme';
COMMENT ON COLUMN tags.is_active IS 'Whether tag is active and visible';
COMMENT ON COLUMN tags.created_by IS 'Clerk user ID who created this tag';
