-- Function to create a product (admin only)
CREATE OR REPLACE FUNCTION admin_create_product(
  p_name TEXT,
  p_description TEXT,
  p_price DECIMAL(10, 2),
  p_stock_quantity INTEGER,
  p_category TEXT,
  p_image_url TEXT,
  p_dimensions TEXT,
  p_material TEXT,
  p_is_featured BOOLEAN
) RETURNS products AS $$
DECLARE
  v_product products;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create products';
  END IF;

  -- Insert the product
  INSERT INTO products (
    name, description, price, stock_quantity,
    category, image_url, dimensions, material, is_featured
  ) VALUES (
    p_name, p_description, p_price, p_stock_quantity,
    p_category, p_image_url, p_dimensions, p_material, p_is_featured
  ) RETURNING * INTO v_product;

  RETURN v_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a product (admin only)
CREATE OR REPLACE FUNCTION admin_update_product(
  p_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_price DECIMAL(10, 2),
  p_stock_quantity INTEGER,
  p_category TEXT,
  p_image_url TEXT,
  p_dimensions TEXT,
  p_material TEXT,
  p_is_featured BOOLEAN
) RETURNS products AS $$
DECLARE
  v_product products;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update products';
  END IF;

  -- Update the product
  UPDATE products
  SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    price = COALESCE(p_price, price),
    stock_quantity = COALESCE(p_stock_quantity, stock_quantity),
    category = COALESCE(p_category, category),
    image_url = COALESCE(p_image_url, image_url),
    dimensions = COALESCE(p_dimensions, dimensions),
    material = COALESCE(p_material, material),
    is_featured = COALESCE(p_is_featured, is_featured),
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_product;

  IF v_product IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  RETURN v_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a product (admin only)
CREATE OR REPLACE FUNCTION admin_delete_product(p_id UUID)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete products';
  END IF;

  -- Delete the product
  DELETE FROM products WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 