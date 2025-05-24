-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create brands table for mirror brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create frame_types table
CREATE TABLE IF NOT EXISTS frame_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  material TEXT NOT NULL, -- 'wood', 'steel', etc.
  color TEXT,
  description TEXT,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'Small', 'Medium', 'Large'
  code TEXT NOT NULL, -- 'sm', 'md', 'lg'
  dimensions TEXT NOT NULL, -- e.g., '12x16 inches'
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(code)
);

-- Create products table with brand reference
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create product_variations table to handle different combinations of size and frame
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id UUID NOT NULL REFERENCES product_sizes(id) ON DELETE CASCADE,
  frame_type_id UUID NOT NULL REFERENCES frame_types(id) ON DELETE CASCADE,
  sku TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL, -- Calculated price including base price + adjustments
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, size_id, frame_type_id)
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

-- Create profiles table (extending auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer', -- 'admin', 'customer'
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

-- Create cart_items table with product variation
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_variation_id UUID NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_variation_id)
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

-- Create order_items table with product variation
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_variation_id UUID NOT NULL REFERENCES product_variations(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Store the name at time of purchase
  size_name TEXT NOT NULL, -- Store the size at time of purchase
  frame_type TEXT NOT NULL, -- Store the frame type at time of purchase
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL, -- Price at time of purchase
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
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

CREATE TRIGGER update_product_categories_timestamp
BEFORE UPDATE ON product_categories
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_brands_timestamp
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_frame_types_timestamp
BEFORE UPDATE ON frame_types
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_sizes_timestamp
BEFORE UPDATE ON product_sizes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_variations_timestamp
BEFORE UPDATE ON product_variations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

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

-- Cart items can be managed by the owner
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cart items can be read by the owner" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Cart items can be inserted by the owner" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cart items can be updated by the owner" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Cart items can be deleted by the owner" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Orders can be managed by the owner
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders can be read by the owner" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Orders can be inserted by the owner" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Orders can be updated by the owner" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Order items can be read by the order owner
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items can be read by the order owner" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create functions for managing cart with product variations
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id UUID,
  p_product_variation_id UUID,
  p_quantity INTEGER
) RETURNS SETOF cart_items AS $$
BEGIN
  -- Insert or update cart item
  RETURN QUERY
  INSERT INTO cart_items (user_id, product_variation_id, quantity)
  VALUES (p_user_id, p_product_variation_id, p_quantity)
  ON CONFLICT (user_id, product_variation_id) 
  DO UPDATE SET 
    quantity = cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update cart quantity
CREATE OR REPLACE FUNCTION update_cart_quantity(
  p_user_id UUID,
  p_product_variation_id UUID,
  p_quantity INTEGER
) RETURNS SETOF cart_items AS $$
BEGIN
  -- If quantity is 0 or less, remove the item
  IF p_quantity <= 0 THEN
    DELETE FROM cart_items
    WHERE user_id = p_user_id AND product_variation_id = p_product_variation_id;
    RETURN;
  END IF;
  
  -- Update quantity
  RETURN QUERY
  UPDATE cart_items
  SET 
    quantity = p_quantity,
    updated_at = now()
  WHERE user_id = p_user_id AND product_variation_id = p_product_variation_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cart with product details
CREATE OR REPLACE FUNCTION get_cart_with_products(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  product_variation_id UUID,
  quantity INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product_variation JSON,
  product JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.product_variation_id,
    c.quantity,
    c.created_at,
    c.updated_at,
    json_build_object(
      'id', pv.id,
      'sku', pv.sku,
      'price', pv.price,
      'stock_quantity', pv.stock_quantity,
      'size', json_build_object(
        'id', ps.id,
        'name', ps.name,
        'code', ps.code,
        'dimensions', ps.dimensions
      ),
      'frame_type', json_build_object(
        'id', ft.id,
        'name', ft.name,
        'material', ft.material,
        'color', ft.color
      )
    ) as product_variation,
    json_build_object(
      'id', p.id,
      'name', p.name,
      'description', p.description,
      'base_price', p.base_price,
      'image_url', p.image_url,
      'brand', json_build_object(
        'id', b.id,
        'name', b.name
      )
    ) as product
  FROM cart_items c
  JOIN product_variations pv ON c.product_variation_id = pv.id
  JOIN products p ON pv.product_id = p.id
  JOIN product_sizes ps ON pv.size_id = ps.id
  JOIN frame_types ft ON pv.frame_type_id = ft.id
  LEFT JOIN brands b ON p.brand_id = b.id
  WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate product variation price
CREATE OR REPLACE FUNCTION calculate_variation_price(
  p_product_id UUID,
  p_size_id UUID,
  p_frame_type_id UUID
) RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_base_price DECIMAL(10, 2);
  v_size_adjustment DECIMAL(10, 2);
  v_frame_adjustment DECIMAL(10, 2);
  v_total_price DECIMAL(10, 2);
BEGIN
  -- Get base price from product
  SELECT base_price INTO v_base_price
  FROM products
  WHERE id = p_product_id;
  
  -- Get size price adjustment
  SELECT price_adjustment INTO v_size_adjustment
  FROM product_sizes
  WHERE id = p_size_id;
  
  -- Get frame price adjustment
  SELECT price_adjustment INTO v_frame_adjustment
  FROM frame_types
  WHERE id = p_frame_type_id;
  
  -- Calculate total price
  v_total_price := v_base_price + COALESCE(v_size_adjustment, 0) + COALESCE(v_frame_adjustment, 0);
  
  RETURN v_total_price;
END;
$$ LANGUAGE plpgsql;

-- Function to create or update product variation
CREATE OR REPLACE FUNCTION create_or_update_product_variation(
  p_product_id UUID,
  p_size_id UUID,
  p_frame_type_id UUID,
  p_sku TEXT,
  p_stock_quantity INTEGER
) RETURNS UUID AS $$
DECLARE
  v_price DECIMAL(10, 2);
  v_variation_id UUID;
BEGIN
  -- Calculate price
  v_price := calculate_variation_price(p_product_id, p_size_id, p_frame_type_id);
  
  -- Insert or update variation
  INSERT INTO product_variations (
    product_id,
    size_id,
    frame_type_id,
    sku,
    stock_quantity,
    price
  )
  VALUES (
    p_product_id,
    p_size_id,
    p_frame_type_id,
    p_sku,
    p_stock_quantity,
    v_price
  )
  ON CONFLICT (product_id, size_id, frame_type_id)
  DO UPDATE SET
    sku = p_sku,
    stock_quantity = p_stock_quantity,
    price = v_price,
    updated_at = now()
  RETURNING id INTO v_variation_id;
  
  RETURN v_variation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for brands
INSERT INTO brands (name, logo_url, description) 
VALUES 
  ('Mirror Exhibit', '/images/brands/mirror-exhibit.png', 'Our signature brand of custom laser-engraved mirrors'),
  ('Reflections', '/images/brands/reflections.png', 'Premium quality mirrors with elegant designs'),
  ('GlassWorks', '/images/brands/glassworks.png', 'Modern and minimalist mirror designs'),
  ('Heritage Mirrors', '/images/brands/heritage.png', 'Classic and vintage-inspired mirror designs'),
  ('Custom Creations', '/images/brands/custom.png', 'Fully customizable mirrors for any space');

-- Insert sample data for frame types
INSERT INTO frame_types (name, material, color, description, price_adjustment) 
VALUES 
  ('Classic Wood', 'wood', 'Brown', 'Traditional wooden frame with a warm finish', 0),
  ('Rustic Wood', 'wood', 'Dark Brown', 'Weathered wooden frame with a rustic appearance', 15),
  ('Modern Steel', 'steel', 'Silver', 'Sleek steel frame with a contemporary look', 25),
  ('Matte Black Steel', 'steel', 'Black', 'Elegant black steel frame with a matte finish', 30),
  ('Brushed Gold Steel', 'steel', 'Gold', 'Luxurious gold-toned steel frame', 45);

-- Insert sample data for product sizes
INSERT INTO product_sizes (name, code, dimensions, price_adjustment) 
VALUES 
  ('Small', 'sm', '12" x 16"', 0),
  ('Medium', 'md', '18" x 24"', 30),
  ('Large', 'lg', '24" x 36"', 60);

-- Insert sample data for categories
INSERT INTO product_categories (name, description, image_url) 
VALUES 
  ('Wall Mirrors', 'Mirrors designed to hang on your wall', '/images/categories/wall.jpg'),
  ('Table Mirrors', 'Free-standing mirrors for tables and dressers', '/images/categories/table.jpg'),
  ('Bathroom Mirrors', 'Moisture-resistant mirrors for bathrooms', '/images/categories/bathroom.jpg'),
  ('Custom Mirrors', 'Personalized and custom designs', '/images/categories/custom.jpg'),
  ('Sports Themed', 'Mirrors featuring sports team logos and designs', '/images/categories/sports.jpg'),
  ('Brand Themed', 'Mirrors featuring popular brand logos', '/images/categories/brand.jpg');

-- Insert sample products
INSERT INTO products (name, description, base_price, brand_id, category_id, image_url, is_featured) 
VALUES 
  (
    'Elegant Circle Mirror', 
    'A beautiful round mirror with a laser-engraved floral pattern around the border.', 
    149.99, 
    (SELECT id FROM brands WHERE name = 'Mirror Exhibit'), 
    (SELECT id FROM product_categories WHERE name = 'Wall Mirrors'),
    '/images/products/circle-mirror.jpg', 
    true
  ),
  (
    'Rectangular Bathroom Mirror', 
    'Perfect addition to your bathroom with a geometric pattern.', 
    129.99, 
    (SELECT id FROM brands WHERE name = 'Reflections'), 
    (SELECT id FROM product_categories WHERE name = 'Bathroom Mirrors'),
    '/images/products/bathroom-mirror.jpg', 
    false
  ),
  (
    'Vintage-inspired Table Mirror', 
    'A small table mirror with art deco designs.', 
    89.99, 
    (SELECT id FROM brands WHERE name = 'Heritage Mirrors'), 
    (SELECT id FROM product_categories WHERE name = 'Table Mirrors'),
    '/images/products/table-mirror.jpg', 
    true
  ),
  (
    'Modern Hexagon Mirror Set', 
    'Set of 3 hexagon mirrors with minimalist designs.', 
    199.99, 
    (SELECT id FROM brands WHERE name = 'GlassWorks'), 
    (SELECT id FROM product_categories WHERE name = 'Wall Mirrors'),
    '/images/products/hexagon-mirror.jpg', 
    true
  ),
  (
    'Personalized Name Mirror', 
    'Custom mirror with your name or phrase engraved.', 
    169.99, 
    (SELECT id FROM brands WHERE name = 'Custom Creations'), 
    (SELECT id FROM product_categories WHERE name = 'Custom Mirrors'),
    '/images/products/custom-mirror.jpg', 
    false
  ),
  (
    'Sports Team Logo Mirror', 
    'Mirror featuring your favorite sports team logo laser-engraved.', 
    179.99, 
    (SELECT id FROM brands WHERE name = 'Mirror Exhibit'), 
    (SELECT id FROM product_categories WHERE name = 'Sports Themed'),
    '/images/products/sports-mirror.jpg', 
    true
  ),
  (
    'Brand Logo Mirror', 
    'Mirror featuring popular brand logos laser-engraved.', 
    189.99, 
    (SELECT id FROM brands WHERE name = 'Mirror Exhibit'), 
    (SELECT id FROM product_categories WHERE name = 'Brand Themed'),
    '/images/products/brand-mirror.jpg', 
    true
  );

-- Create product variations for each product with all size and frame combinations
DO $$
DECLARE
  product_rec RECORD;
  size_rec RECORD;
  frame_rec RECORD;
  sku_text TEXT;
BEGIN
  FOR product_rec IN SELECT id, name FROM products LOOP
    FOR size_rec IN SELECT id, code FROM product_sizes LOOP
      FOR frame_rec IN SELECT id, material FROM frame_types LOOP
        -- Generate SKU
        sku_text := SUBSTRING(REPLACE(LOWER(product_rec.name), ' ', '-'), 1, 10) || '-' || 
                    size_rec.code || '-' || 
                    SUBSTRING(REPLACE(LOWER(frame_rec.material), ' ', '-'), 1, 5);
        
        -- Create variation with random stock
        PERFORM create_or_update_product_variation(
          product_rec.id,
          size_rec.id,
          frame_rec.id,
          sku_text,
          FLOOR(RANDOM() * 20 + 5)::INTEGER -- Random stock between 5-25
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
