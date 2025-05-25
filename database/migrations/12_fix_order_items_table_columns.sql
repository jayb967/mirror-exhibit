-- Fix missing columns in order_items table
-- Add all columns that the order creation API expects

DO $$
BEGIN
    -- Add price column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'price') THEN
        ALTER TABLE order_items ADD COLUMN price DECIMAL(10,2);
    END IF;

    -- Add unit_price column if it doesn't exist (some schemas use this instead of price)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'unit_price') THEN
        ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10,2);
    END IF;

    -- Add total_price column if it doesn't exist (unit_price * quantity)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'total_price') THEN
        ALTER TABLE order_items ADD COLUMN total_price DECIMAL(10,2);
    END IF;

    -- Add product_name column if it doesn't exist (from previous migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'product_name') THEN
        ALTER TABLE order_items ADD COLUMN product_name TEXT;
    END IF;

    -- Add variation_id column if it doesn't exist (from previous migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'variation_id') THEN
        ALTER TABLE order_items ADD COLUMN variation_id UUID;
    END IF;

    -- Add size_name column if it doesn't exist (from previous migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'size_name') THEN
        ALTER TABLE order_items ADD COLUMN size_name TEXT;
    END IF;

    -- Add frame_name column if it doesn't exist (from previous migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'frame_name') THEN
        ALTER TABLE order_items ADD COLUMN frame_name TEXT;
    END IF;

    -- Ensure order_id exists and is properly typed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'order_id') THEN
        ALTER TABLE order_items ADD COLUMN order_id UUID NOT NULL;
    END IF;

    -- Ensure product_id exists and is properly typed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'product_id') THEN
        ALTER TABLE order_items ADD COLUMN product_id UUID NOT NULL;
    END IF;

    -- Ensure quantity exists and is properly typed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'quantity') THEN
        ALTER TABLE order_items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
    END IF;

    -- Add timestamps if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'created_at') THEN
        ALTER TABLE order_items ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'order_items' AND column_name = 'updated_at') THEN
        ALTER TABLE order_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;

END $$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key to orders table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'order_items_order_id_fkey'
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items
        ADD CONSTRAINT order_items_order_id_fkey
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;

    -- Add foreign key to products table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'order_items_product_id_fkey'
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE order_items
        ADD CONSTRAINT order_items_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not add foreign key constraints: %', SQLERRM;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variation_id ON order_items(variation_id);

-- Add comments for documentation
COMMENT ON COLUMN order_items.price IS 'Price of the item at time of order';
COMMENT ON COLUMN order_items.unit_price IS 'Unit price of the item (same as price, for schema compatibility)';
COMMENT ON COLUMN order_items.total_price IS 'Total price for this line item (unit_price * quantity)';
COMMENT ON COLUMN order_items.product_name IS 'Product name at time of order (for historical reference)';
COMMENT ON COLUMN order_items.variation_id IS 'Reference to product variation if applicable';
COMMENT ON COLUMN order_items.size_name IS 'Size option selected for this item';
COMMENT ON COLUMN order_items.frame_name IS 'Frame option selected for this item';

-- Success message
SELECT 'Order items table updated successfully with all required columns' as result;
