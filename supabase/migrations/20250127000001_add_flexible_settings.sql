-- Add flexible settings column to site_settings table
-- This allows storing additional settings without schema changes

-- Add a JSONB column for flexible settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS additional_settings JSONB DEFAULT '{}'::jsonb;

-- Add columns that might be missing from legacy settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS site_name TEXT,
ADD COLUMN IF NOT EXISTS site_description TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS favicon_url TEXT,
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false;

-- Create an index on the additional_settings JSONB column for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_additional_settings 
ON site_settings USING GIN (additional_settings);

-- Update existing record to include legacy settings in additional_settings if they exist
UPDATE site_settings 
SET additional_settings = additional_settings || jsonb_build_object(
  'legacy_migrated', true,
  'migration_date', now()
)
WHERE additional_settings IS NOT NULL;

-- Create a function to safely get settings with fallbacks
CREATE OR REPLACE FUNCTION get_site_setting(setting_key TEXT, fallback_value TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- First try to get from direct column
  EXECUTE format('SELECT %I FROM site_settings LIMIT 1', setting_key) INTO result;
  
  -- If not found or null, try additional_settings JSONB
  IF result IS NULL THEN
    SELECT additional_settings ->> setting_key INTO result FROM site_settings LIMIT 1;
  END IF;
  
  -- Return fallback if still null
  RETURN COALESCE(result, fallback_value);
EXCEPTION
  WHEN OTHERS THEN
    -- If column doesn't exist, try additional_settings
    SELECT additional_settings ->> setting_key INTO result FROM site_settings LIMIT 1;
    RETURN COALESCE(result, fallback_value);
END;
$$ LANGUAGE plpgsql;

-- Create a function to safely set settings
CREATE OR REPLACE FUNCTION set_site_setting(setting_key TEXT, setting_value TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  -- Check if column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'site_settings' 
    AND column_name = setting_key
  ) INTO column_exists;
  
  IF column_exists THEN
    -- Update direct column
    EXECUTE format('UPDATE site_settings SET %I = %L', setting_key, setting_value);
  ELSE
    -- Update additional_settings JSONB
    UPDATE site_settings 
    SET additional_settings = additional_settings || jsonb_build_object(setting_key, setting_value);
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to additional_settings
    UPDATE site_settings 
    SET additional_settings = additional_settings || jsonb_build_object(setting_key, setting_value);
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION get_site_setting(TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION set_site_setting(TEXT, TEXT) TO authenticated;
