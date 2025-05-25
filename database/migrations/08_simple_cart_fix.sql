-- Simple direct fix for cart issues
-- Run this if the previous migration doesn't work

-- Step 1: Drop the cart_items table and recreate it with correct structure
DROP TABLE IF EXISTS cart_items CASCADE;

-- Step 2: Create cart_items table with correct structure for Clerk
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL, -- TEXT for Clerk compatibility
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  variation_id UUID,
  size_name TEXT,
  frame_name TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 3: Create indexes
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_user_product ON cart_items(user_id, product_id);

-- Step 4: Drop existing add_to_cart functions
DROP FUNCTION IF EXISTS add_to_cart CASCADE;

-- Step 5: Create the add_to_cart function
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

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION add_to_cart TO authenticated, anon;

-- Step 7: Add comment
COMMENT ON FUNCTION add_to_cart IS 'Add item to cart or update quantity if item already exists with same options';

-- Success message
SELECT 'Cart table recreated successfully with TEXT user_id for Clerk compatibility' as result;
