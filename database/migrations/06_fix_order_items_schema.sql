-- Fix order_items table schema to match the data being inserted
-- Add missing columns that are being referenced in the code

-- Check if columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add frame_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'frame_name') THEN
        ALTER TABLE order_items ADD COLUMN frame_name TEXT;
    END IF;
    
    -- Add size_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'size_name') THEN
        ALTER TABLE order_items ADD COLUMN size_name TEXT;
    END IF;
    
    -- Add product_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'product_name') THEN
        ALTER TABLE order_items ADD COLUMN product_name TEXT;
    END IF;
    
    -- Add variation_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'order_items' AND column_name = 'variation_id') THEN
        ALTER TABLE order_items ADD COLUMN variation_id UUID;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN order_items.frame_name IS 'Name of the frame option selected';
COMMENT ON COLUMN order_items.size_name IS 'Name of the size option selected';
COMMENT ON COLUMN order_items.product_name IS 'Product name at time of order (for historical reference)';
COMMENT ON COLUMN order_items.variation_id IS 'Reference to product variation if applicable';
