-- Create guest_users table
CREATE TABLE IF NOT EXISTS guest_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  apartment TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  guest_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create guest_cart_items table
CREATE TABLE IF NOT EXISTS guest_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_token TEXT NOT NULL REFERENCES guest_users(guest_token) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(guest_token, product_id)
);

-- Modify orders table to allow guest orders
ALTER TABLE orders 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_token column to orders table
ALTER TABLE orders 
  ADD COLUMN guest_token TEXT REFERENCES guest_users(guest_token) ON DELETE SET NULL;

-- Create functions for managing guest cart
CREATE OR REPLACE FUNCTION add_to_guest_cart(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF guest_cart_items AS $$
BEGIN
  -- Insert or update cart item
  RETURN QUERY
  INSERT INTO guest_cart_items (guest_token, product_id, quantity)
  VALUES (p_guest_token, p_product_id, p_quantity)
  ON CONFLICT (guest_token, product_id) 
  DO UPDATE SET 
    quantity = guest_cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_guest_cart_quantity(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF guest_cart_items AS $$
BEGIN
  IF p_quantity <= 0 THEN
    -- Remove item from cart if quantity is 0 or negative
    DELETE FROM guest_cart_items 
    WHERE guest_token = p_guest_token AND product_id = p_product_id;
    
    -- Return empty set
    RETURN;
  ELSE
    -- Update quantity
    RETURN QUERY
    UPDATE guest_cart_items 
    SET 
      quantity = p_quantity,
      updated_at = now()
    WHERE 
      guest_token = p_guest_token AND 
      product_id = p_product_id
    RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get guest cart with product details
CREATE OR REPLACE FUNCTION get_guest_cart_with_products(p_guest_token TEXT)
RETURNS TABLE (
  id UUID,
  guest_token TEXT,
  product_id UUID,
  quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  product_name TEXT,
  product_price DECIMAL(10,2),
  product_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.guest_token,
    c.product_id,
    c.quantity,
    c.created_at,
    c.updated_at,
    p.name,
    p.price,
    p.image_url
  FROM 
    guest_cart_items c
  JOIN 
    products p ON c.product_id = p.id
  WHERE 
    c.guest_token = p_guest_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to convert guest user to registered user
CREATE OR REPLACE FUNCTION convert_guest_to_user(
  p_guest_token TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_guest_cart_item RECORD;
BEGIN
  -- Transfer cart items from guest to user
  FOR v_guest_cart_item IN 
    SELECT product_id, quantity FROM guest_cart_items WHERE guest_token = p_guest_token
  LOOP
    -- Add to user's cart using existing function
    PERFORM add_to_cart(p_user_id, v_guest_cart_item.product_id, v_guest_cart_item.quantity);
  END LOOP;
  
  -- Update any orders associated with this guest
  UPDATE orders
  SET 
    user_id = p_user_id,
    guest_token = NULL
  WHERE guest_token = p_guest_token;
  
  -- Delete guest cart items
  DELETE FROM guest_cart_items WHERE guest_token = p_guest_token;
  
  -- Delete guest user
  DELETE FROM guest_users WHERE guest_token = p_guest_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for guest tables
ALTER TABLE guest_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guest users can be read by anyone with the token" ON guest_users
  FOR SELECT USING (true);
CREATE POLICY "Guest users can be inserted by anyone" ON guest_users
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Guest users can be updated by anyone with the token" ON guest_users
  FOR UPDATE USING (true);

ALTER TABLE guest_cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guest cart items can be read by anyone with the token" ON guest_cart_items
  FOR SELECT USING (true);
CREATE POLICY "Guest cart items can be inserted by anyone" ON guest_cart_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Guest cart items can be updated by anyone with the token" ON guest_cart_items
  FOR UPDATE USING (true);
CREATE POLICY "Guest cart items can be deleted by anyone with the token" ON guest_cart_items
  FOR DELETE USING (true);

-- Create triggers to update timestamps
CREATE TRIGGER update_guest_users_timestamp
BEFORE UPDATE ON guest_users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_guest_cart_items_timestamp
BEFORE UPDATE ON guest_cart_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
