-- Update guest_cart_items table to support existing product_variations system
-- This migration adds support for the existing product_variations table

-- Add product_variation_id column to reference existing variations
ALTER TABLE public.guest_cart_items
ADD COLUMN IF NOT EXISTS product_variation_id UUID REFERENCES public.product_variations(id) ON DELETE CASCADE;

-- Update the unique constraint to include variation
ALTER TABLE public.guest_cart_items
DROP CONSTRAINT IF EXISTS guest_cart_items_guest_token_product_id_key;

-- Add new unique constraint that includes variation
-- Allow same product with different variations
ALTER TABLE public.guest_cart_items
ADD CONSTRAINT guest_cart_items_unique_item
UNIQUE (guest_token, product_id, product_variation_id);

-- Create index on product_variation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_guest_cart_items_variation_id
ON public.guest_cart_items(product_variation_id);

-- Update the add_to_guest_cart function to support existing product_variations
CREATE OR REPLACE FUNCTION public.add_to_guest_cart_with_variation(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER,
  p_product_variation_id UUID DEFAULT NULL
) RETURNS SETOF public.guest_cart_items AS $$
BEGIN
  -- Insert or update cart item with variation support
  RETURN QUERY
  INSERT INTO public.guest_cart_items (
    guest_token,
    product_id,
    quantity,
    product_variation_id
  )
  VALUES (
    p_guest_token,
    p_product_id,
    p_quantity,
    p_product_variation_id
  )
  ON CONFLICT (guest_token, product_id, product_variation_id)
  DO UPDATE SET
    quantity = guest_cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_guest_cart_with_products function to include variation data from existing tables
CREATE OR REPLACE FUNCTION public.get_guest_cart_with_products_enhanced(p_guest_token TEXT)
RETURNS TABLE (
  id UUID,
  guest_token TEXT,
  product_id UUID,
  quantity INTEGER,
  product_variation_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  product_name TEXT,
  product_base_price DECIMAL(10,2),
  product_image TEXT,
  variation_price DECIMAL(10,2),
  size_name TEXT,
  frame_name TEXT,
  size_dimensions TEXT,
  frame_material TEXT,
  frame_color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.guest_token,
    c.product_id,
    c.quantity,
    c.product_variation_id,
    c.created_at,
    c.updated_at,
    p.name,
    p.base_price,
    p.image_url,
    COALESCE(pv.price, p.base_price) as variation_price,
    COALESCE(ps.name, 'Standard') as size_name,
    COALESCE(ft.name, 'Standard') as frame_name,
    ps.dimensions as size_dimensions,
    ft.material as frame_material,
    ft.color as frame_color
  FROM
    public.guest_cart_items c
  JOIN
    public.products p ON c.product_id = p.id
  LEFT JOIN
    public.product_variations pv ON c.product_variation_id = pv.id
  LEFT JOIN
    public.product_sizes ps ON pv.size_id = ps.id
  LEFT JOIN
    public.frame_types ft ON pv.frame_type_id = ft.id
  WHERE
    c.guest_token = p_guest_token
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update guest cart item quantity
CREATE OR REPLACE FUNCTION public.update_guest_cart_quantity(
  p_guest_token TEXT,
  p_product_id UUID,
  p_product_variation_id UUID,
  p_quantity INTEGER
) RETURNS SETOF public.guest_cart_items AS $$
BEGIN
  IF p_quantity <= 0 THEN
    -- Remove item if quantity is 0 or negative
    DELETE FROM public.guest_cart_items
    WHERE guest_token = p_guest_token
      AND product_id = p_product_id
      AND (product_variation_id = p_product_variation_id OR (product_variation_id IS NULL AND p_product_variation_id IS NULL));
    RETURN;
  ELSE
    -- Update quantity
    RETURN QUERY
    UPDATE public.guest_cart_items
    SET
      quantity = p_quantity,
      updated_at = now()
    WHERE guest_token = p_guest_token
      AND product_id = p_product_id
      AND (product_variation_id = p_product_variation_id OR (product_variation_id IS NULL AND p_product_variation_id IS NULL))
    RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove specific item from guest cart
CREATE OR REPLACE FUNCTION public.remove_from_guest_cart(
  p_guest_token TEXT,
  p_product_id UUID,
  p_product_variation_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.guest_cart_items
  WHERE guest_token = p_guest_token
    AND product_id = p_product_id
    AND (product_variation_id = p_product_variation_id OR (product_variation_id IS NULL AND p_product_variation_id IS NULL));

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment explaining the new structure
COMMENT ON COLUMN public.guest_cart_items.product_variation_id IS 'References the specific product variation from existing product_variations table';
