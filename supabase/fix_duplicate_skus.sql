-- Fix Duplicate SKUs in Product Variations
-- This script identifies and fixes duplicate SKUs by appending unique counters

-- First, let's see what duplicates we have
SELECT 
  sku, 
  COUNT(*) as duplicate_count,
  array_agg(id) as variation_ids
FROM product_variations 
WHERE sku IS NOT NULL 
GROUP BY sku 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Function to generate a unique SKU based on product, size, and frame type
CREATE OR REPLACE FUNCTION generate_unique_sku(
  p_product_name TEXT,
  p_size_code TEXT,
  p_frame_name TEXT,
  p_exclude_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  clean_product TEXT;
  clean_size TEXT;
  clean_frame TEXT;
  base_sku TEXT;
  final_sku TEXT;
  counter INTEGER := 1;
  existing_count INTEGER;
BEGIN
  -- Clean and format the components
  clean_product := SUBSTRING(REGEXP_REPLACE(LOWER(p_product_name), '[^a-z0-9]', '', 'g'), 1, 8);
  clean_size := REGEXP_REPLACE(LOWER(p_size_code), '[^a-z0-9]', '', 'g');
  clean_frame := SUBSTRING(REGEXP_REPLACE(LOWER(p_frame_name), '[^a-z0-9]', '', 'g'), 1, 8);
  
  -- Create base SKU
  base_sku := clean_product || '-' || clean_size || '-' || clean_frame;
  final_sku := base_sku;
  
  -- Check for duplicates and append counter if needed
  LOOP
    SELECT COUNT(*) INTO existing_count
    FROM product_variations 
    WHERE sku = final_sku 
    AND (p_exclude_id IS NULL OR id != p_exclude_id);
    
    -- If no duplicates found, we have a unique SKU
    IF existing_count = 0 THEN
      EXIT;
    END IF;
    
    -- SKU exists, try with counter
    final_sku := base_sku || '-' || counter;
    counter := counter + 1;
    
    -- Safety check to prevent infinite loop
    IF counter > 999 THEN
      final_sku := base_sku || '-' || EXTRACT(EPOCH FROM NOW())::INTEGER;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_sku;
END;
$$ LANGUAGE plpgsql;

-- Update duplicate SKUs with unique values
DO $$
DECLARE
  variation_record RECORD;
  product_name TEXT;
  size_code TEXT;
  frame_name TEXT;
  new_sku TEXT;
  duplicate_groups CURSOR FOR
    SELECT sku, array_agg(id ORDER BY created_at) as ids
    FROM product_variations 
    WHERE sku IS NOT NULL 
    GROUP BY sku 
    HAVING COUNT(*) > 1;
BEGIN
  -- Process each group of duplicate SKUs
  FOR dup_group IN duplicate_groups LOOP
    RAISE NOTICE 'Processing duplicate SKU: %', dup_group.sku;
    
    -- Keep the first variation with the original SKU, update the rest
    FOR i IN 2..array_length(dup_group.ids, 1) LOOP
      -- Get variation details
      SELECT 
        p.name,
        ps.code,
        COALESCE(ft.name, ft.material, 'frame') as frame_identifier
      INTO product_name, size_code, frame_name
      FROM product_variations pv
      JOIN products p ON pv.product_id = p.id
      JOIN product_sizes ps ON pv.size_id = ps.id
      JOIN frame_types ft ON pv.frame_type_id = ft.id
      WHERE pv.id = dup_group.ids[i];
      
      -- Generate new unique SKU
      new_sku := generate_unique_sku(product_name, size_code, frame_name, dup_group.ids[i]);
      
      -- Update the variation with new SKU
      UPDATE product_variations 
      SET sku = new_sku, updated_at = NOW()
      WHERE id = dup_group.ids[i];
      
      RAISE NOTICE 'Updated variation % from SKU % to %', dup_group.ids[i], dup_group.sku, new_sku;
    END LOOP;
  END LOOP;
END;
$$;

-- Update any NULL SKUs with proper values
UPDATE product_variations 
SET sku = generate_unique_sku(
  (SELECT name FROM products WHERE id = product_variations.product_id),
  (SELECT code FROM product_sizes WHERE id = product_variations.size_id),
  (SELECT COALESCE(name, material, 'frame') FROM frame_types WHERE id = product_variations.frame_type_id)
),
updated_at = NOW()
WHERE sku IS NULL OR sku = '';

-- Verify no duplicates remain
SELECT 
  'Duplicate Check' as check_type,
  COUNT(*) as total_variations,
  COUNT(DISTINCT sku) as unique_skus,
  COUNT(*) - COUNT(DISTINCT sku) as remaining_duplicates
FROM product_variations 
WHERE sku IS NOT NULL;

-- Show any remaining duplicates (should be 0)
SELECT 
  sku, 
  COUNT(*) as count,
  array_agg(id) as variation_ids
FROM product_variations 
WHERE sku IS NOT NULL 
GROUP BY sku 
HAVING COUNT(*) > 1;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS generate_unique_sku(TEXT, TEXT, TEXT, UUID);

-- Add a unique constraint to prevent future duplicates (optional)
-- Uncomment the next line if you want to enforce unique SKUs at the database level
-- ALTER TABLE product_variations ADD CONSTRAINT unique_sku UNIQUE (sku);

COMMIT;
