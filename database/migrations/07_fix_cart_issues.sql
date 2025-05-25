-- Fix cart-related database issues
-- 1. Create missing add_to_cart RPC function
-- 2. Fix cart_items table relationships

-- First, let's check the current cart_items table structure
-- and fix the foreign key relationship

-- Check current cart_items table structure and fix it
DO $$
DECLARE
    has_product_id BOOLEAN;
    has_product_variation_id BOOLEAN;
    user_id_type TEXT;
BEGIN
    -- Check what columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cart_items' AND column_name = 'product_id'
    ) INTO has_product_id;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cart_items' AND column_name = 'product_variation_id'
    ) INTO has_product_variation_id;

    -- Check user_id column type
    SELECT data_type INTO user_id_type
    FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'user_id';

    RAISE NOTICE 'Cart items table has product_id: %, has product_variation_id: %, user_id type: %', has_product_id, has_product_variation_id, user_id_type;

    -- Fix user_id column type if it's UUID (Clerk uses TEXT)
    IF user_id_type = 'uuid' THEN
        -- Drop foreign key constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'cart_items_user_id_fkey'
            AND table_name = 'cart_items'
        ) THEN
            ALTER TABLE cart_items DROP CONSTRAINT cart_items_user_id_fkey;
        END IF;

        -- Change user_id column type to TEXT
        ALTER TABLE cart_items ALTER COLUMN user_id TYPE TEXT;
        RAISE NOTICE 'Changed user_id column type from UUID to TEXT for Clerk compatibility';
    END IF;

    -- If table has product_variation_id but not product_id, add product_id
    IF has_product_variation_id AND NOT has_product_id THEN
        ALTER TABLE cart_items ADD COLUMN product_id UUID;

        -- Populate product_id from product_variations
        UPDATE cart_items
        SET product_id = pv.product_id
        FROM product_variations pv
        WHERE cart_items.product_variation_id = pv.id;

        -- Add foreign key constraint
        ALTER TABLE cart_items
        ADD CONSTRAINT cart_items_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

        RAISE NOTICE 'Added product_id column and populated from product_variations';
    END IF;

    -- If table has neither, add product_id
    IF NOT has_product_id AND NOT has_product_variation_id THEN
        ALTER TABLE cart_items ADD COLUMN product_id UUID;

        -- Add foreign key constraint
        ALTER TABLE cart_items
        ADD CONSTRAINT cart_items_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

        RAISE NOTICE 'Added product_id column to empty cart_items table';
    END IF;

    -- Add other missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'cart_items' AND column_name = 'variation_id') THEN
        ALTER TABLE cart_items ADD COLUMN variation_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'cart_items' AND column_name = 'size_name') THEN
        ALTER TABLE cart_items ADD COLUMN size_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'cart_items' AND column_name = 'frame_name') THEN
        ALTER TABLE cart_items ADD COLUMN frame_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'cart_items' AND column_name = 'price') THEN
        ALTER TABLE cart_items ADD COLUMN price DECIMAL(10,2);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating cart_items table: %', SQLERRM;
END $$;

-- Drop existing add_to_cart functions to avoid conflicts
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Find and drop all add_to_cart functions
    FOR func_record IN
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc
        WHERE proname = 'add_to_cart'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS add_to_cart(' || func_record.args || ') CASCADE';
    END LOOP;
END $$;

-- Create the new add_to_cart RPC function
CREATE FUNCTION add_to_cart(
    p_user_id TEXT,
    p_product_id UUID,
    p_quantity INTEGER DEFAULT 1,
    p_variation_id UUID DEFAULT NULL,
    p_size_name TEXT DEFAULT NULL,
    p_frame_name TEXT DEFAULT NULL,
    p_price DECIMAL DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_item_id UUID;
    result JSON;
    final_price DECIMAL;
BEGIN
    -- Get the product price if not provided
    IF p_price IS NULL THEN
        SELECT base_price INTO final_price
        FROM products
        WHERE id = p_product_id;

        IF final_price IS NULL THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Product not found'
            );
        END IF;
    ELSE
        final_price := p_price;
    END IF;

    -- Check if item already exists in cart with same options
    SELECT id INTO existing_item_id
    FROM cart_items
    WHERE user_id = p_user_id
      AND product_id = p_product_id
      AND (variation_id = p_variation_id OR (variation_id IS NULL AND p_variation_id IS NULL))
      AND (size_name = p_size_name OR (size_name IS NULL AND p_size_name IS NULL))
      AND (frame_name = p_frame_name OR (frame_name IS NULL AND p_frame_name IS NULL));

    IF existing_item_id IS NOT NULL THEN
        -- Update existing item quantity
        UPDATE cart_items
        SET quantity = quantity + p_quantity,
            updated_at = NOW()
        WHERE id = existing_item_id;

        result := json_build_object(
            'success', true,
            'action', 'updated',
            'item_id', existing_item_id
        );
    ELSE
        -- Insert new item
        INSERT INTO cart_items (
            user_id,
            product_id,
            quantity,
            variation_id,
            size_name,
            frame_name,
            price,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_product_id,
            p_quantity,
            p_variation_id,
            p_size_name,
            p_frame_name,
            final_price,
            NOW(),
            NOW()
        ) RETURNING id INTO existing_item_id;

        result := json_build_object(
            'success', true,
            'action', 'created',
            'item_id', existing_item_id
        );
    END IF;

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION add_to_cart TO authenticated, anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product
ON cart_items(user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id
ON cart_items(user_id);

-- Add comments for documentation
COMMENT ON FUNCTION add_to_cart IS 'Add item to cart or update quantity if item already exists with same options';
