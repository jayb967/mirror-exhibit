-- Function to create a category (admin only)
CREATE OR REPLACE FUNCTION admin_create_category(
  p_name TEXT,
  p_description TEXT,
  p_image_url TEXT,
  p_parent_id UUID DEFAULT NULL
) RETURNS product_categories AS $$
DECLARE
  v_category product_categories;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can create categories';
  END IF;

  -- Insert the category
  INSERT INTO product_categories (
    name, description, image_url, parent_id
  ) VALUES (
    p_name, p_description, p_image_url, p_parent_id
  ) RETURNING * INTO v_category;

  RETURN v_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a category (admin only)
CREATE OR REPLACE FUNCTION admin_update_category(
  p_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_image_url TEXT,
  p_parent_id UUID
) RETURNS product_categories AS $$
DECLARE
  v_category product_categories;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can update categories';
  END IF;

  -- Update the category
  UPDATE product_categories
  SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    image_url = COALESCE(p_image_url, image_url),
    parent_id = COALESCE(p_parent_id, parent_id),
    updated_at = now()
  WHERE id = p_id
  RETURNING * INTO v_category;

  IF v_category IS NULL THEN
    RAISE EXCEPTION 'Category not found';
  END IF;

  RETURN v_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a category (admin only)
CREATE OR REPLACE FUNCTION admin_delete_category(p_id UUID)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete categories';
  END IF;

  -- Check if category has products
  IF EXISTS (
    SELECT 1 FROM product_category_map
    WHERE category_id = p_id
  ) THEN
    RAISE EXCEPTION 'Cannot delete category with associated products';
  END IF;

  -- Check if category has children
  IF EXISTS (
    SELECT 1 FROM product_categories
    WHERE parent_id = p_id
  ) THEN
    RAISE EXCEPTION 'Cannot delete category with child categories';
  END IF;

  -- Delete the category
  DELETE FROM product_categories WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Category not found';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get category tree (admin only)
CREATE OR REPLACE FUNCTION admin_get_category_tree()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  image_url TEXT,
  parent_id UUID,
  level INTEGER,
  path TEXT[]
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can view category tree';
  END IF;

  RETURN QUERY
  WITH RECURSIVE category_tree AS (
    -- Base case: get root categories
    SELECT 
      id,
      name,
      description,
      image_url,
      parent_id,
      1 as level,
      ARRAY[name] as path
    FROM product_categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case: get child categories
    SELECT 
      c.id,
      c.name,
      c.description,
      c.image_url,
      c.parent_id,
      ct.level + 1,
      ct.path || c.name
    FROM product_categories c
    JOIN category_tree ct ON ct.id = c.parent_id
  )
  SELECT * FROM category_tree
  ORDER BY path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 