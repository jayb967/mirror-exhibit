-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  image_url TEXT,
  dimensions TEXT,
  material TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table (extending auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  apartment TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, paid, processing, shipped, delivered, canceled, refunded, failed
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT,
  payment_intent_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a junction table for products and categories
CREATE TABLE IF NOT EXISTS product_category_map (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Create a table for wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Default Wishlist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for wishlist items
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);

-- Create a table for coupons and promotions
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL, -- percentage or fixed
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies
-- Products can be read by anyone, but only admin can modify
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products can be read by anyone" ON products
  FOR SELECT USING (true);

-- Profiles can be read and updated by the owner
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles can be read by the owner" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles can be updated by the owner" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles can be inserted by the owner" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Cart items can be read, updated, and deleted by the owner
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cart items can be read by the owner" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Cart items can be inserted by the owner" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cart items can be updated by the owner" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Cart items can be deleted by the owner" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Orders can be read by the owner
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders can be read by the owner" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Orders can be inserted by the owner" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Orders can be updated by the owner" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Order items can be read by the owner of the parent order
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items can be read by the order owner" ON order_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM orders WHERE id = order_items.order_id
    )
  );
CREATE POLICY "Order items can be inserted by authenticated users" ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Reviews can be read by anyone but only created/updated by the owner
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews can be read by anyone" ON product_reviews
  FOR SELECT USING (true);
CREATE POLICY "Reviews can be inserted by the owner" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reviews can be updated by the owner" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Reviews can be deleted by the owner" ON product_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions for managing cart
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF cart_items AS $$
BEGIN
  -- Insert or update cart item
  RETURN QUERY
  INSERT INTO cart_items (user_id, product_id, quantity)
  VALUES (p_user_id, p_product_id, p_quantity)
  ON CONFLICT (user_id, product_id) 
  DO UPDATE SET 
    quantity = cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_cart_quantity(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF cart_items AS $$
BEGIN
  IF p_quantity <= 0 THEN
    -- Remove item from cart if quantity is 0 or negative
    DELETE FROM cart_items 
    WHERE user_id = p_user_id AND product_id = p_product_id;
    
    -- Return empty set
    RETURN;
  ELSE
    -- Update quantity
    RETURN QUERY
    UPDATE cart_items 
    SET 
      quantity = p_quantity,
      updated_at = now()
    WHERE 
      user_id = p_user_id AND 
      product_id = p_product_id
    RETURNING *;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get cart with product details
CREATE OR REPLACE FUNCTION get_cart_with_products(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  product_id UUID,
  quantity INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product_name TEXT,
  product_price DECIMAL(10,2),
  product_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.product_id,
    c.quantity,
    c.created_at,
    c.updated_at,
    p.name,
    p.price,
    p.image_url
  FROM 
    cart_items c
  JOIN 
    products p ON c.product_id = p.id
  WHERE 
    c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sample data (comment out for production)
INSERT INTO products (name, description, price, stock_quantity, category, image_url, dimensions, material, is_featured) 
VALUES 
  ('Elegant Circle Mirror', 'A beautiful round mirror with a laser-engraved floral pattern around the border.', 149.99, 15, 'Wall Mirror', 'https://example.com/images/mirror1.jpg', '24" diameter', 'Glass with bamboo frame', true),
  ('Rectangular Bathroom Mirror', 'Perfect addition to your bathroom with a geometric pattern.', 129.99, 20, 'Bathroom Mirror', 'https://example.com/images/mirror2.jpg', '36" x 24"', 'Glass with metal frame', false),
  ('Vintage-inspired Table Mirror', 'A small table mirror with art deco designs.', 89.99, 30, 'Table Mirror', 'https://example.com/images/mirror3.jpg', '12" x 8"', 'Glass with brass stand', true),
  ('Modern Hexagon Mirror Set', 'Set of 3 hexagon mirrors with minimalist designs.', 199.99, 10, 'Wall Mirror', 'https://example.com/images/mirror4.jpg', '10" each', 'Glass with wooden frame', true),
  ('Personalized Name Mirror', 'Custom mirror with your name or phrase engraved.', 169.99, 0, 'Custom Mirror', 'https://example.com/images/mirror5.jpg', '18" x 24"', 'Glass with customizable frame', false);

-- Insert categories
INSERT INTO product_categories (name, description, image_url) 
VALUES 
  ('Wall Mirrors', 'Mirrors designed to hang on your wall', 'https://example.com/images/categories/wall.jpg'),
  ('Table Mirrors', 'Free-standing mirrors for tables and dressers', 'https://example.com/images/categories/table.jpg'),
  ('Bathroom Mirrors', 'Moisture-resistant mirrors for bathrooms', 'https://example.com/images/categories/bathroom.jpg'),
  ('Custom Mirrors', 'Personalized and custom designs', 'https://example.com/images/categories/custom.jpg'),
  ('Sets', 'Multiple mirror sets', 'https://example.com/images/categories/sets.jpg');

-- Create triggers to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_cart_items_timestamp
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_reviews_timestamp
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_categories_timestamp
BEFORE UPDATE ON product_categories
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_wishlists_timestamp
BEFORE UPDATE ON wishlists
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_coupons_timestamp
BEFORE UPDATE ON coupons
FOR EACH ROW
EXECUTE FUNCTION update_timestamp(); 