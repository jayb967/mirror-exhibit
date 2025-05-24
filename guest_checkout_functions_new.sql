-- Function to add an item to a guest user's cart
CREATE OR REPLACE FUNCTION public.add_to_guest_cart(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF public.guest_cart_items AS $$
DECLARE
  v_product_exists BOOLEAN;
BEGIN
  -- Check if product exists
  SELECT EXISTS(SELECT 1 FROM public.products WHERE id = p_product_id) INTO v_product_exists;
  
  IF NOT v_product_exists THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Set guest token for RLS policies
  PERFORM set_config('app.current_guest_token', p_guest_token, true);
  
  -- Insert or update cart item
  RETURN QUERY
  INSERT INTO public.guest_cart_items (guest_token, product_id, quantity)
  VALUES (p_guest_token, p_product_id, p_quantity)
  ON CONFLICT (guest_token, product_id) 
  DO UPDATE SET 
    quantity = guest_cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update the quantity of an item in a guest user's cart
CREATE OR REPLACE FUNCTION public.update_guest_cart_quantity(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF public.guest_cart_items AS $$
BEGIN
  -- Set guest token for RLS policies
  PERFORM set_config('app.current_guest_token', p_guest_token, true);
  
  IF p_quantity <= 0 THEN
    -- Remove item from cart if quantity is 0 or negative
    DELETE FROM public.guest_cart_items 
    WHERE guest_token = p_guest_token AND product_id = p_product_id;
    
    -- Return empty set
    RETURN;
  ELSE
    -- Update quantity
    RETURN QUERY
    UPDATE public.guest_cart_items 
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

-- Function to get guest cart items with product details
CREATE OR REPLACE FUNCTION public.get_guest_cart_with_products(
  p_guest_token TEXT
) RETURNS TABLE (
  id UUID,
  guest_token TEXT,
  product_id UUID,
  quantity INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  product_name TEXT,
  product_price NUMERIC,
  product_image_url TEXT
) AS $$
BEGIN
  -- Set guest token for RLS policies
  PERFORM set_config('app.current_guest_token', p_guest_token, true);
  
  RETURN QUERY
  SELECT 
    gci.id,
    gci.guest_token,
    gci.product_id,
    gci.quantity,
    gci.created_at,
    gci.updated_at,
    p.name AS product_name,
    p.base_price AS product_price,
    p.image_url AS product_image_url
  FROM 
    public.guest_cart_items gci
  JOIN 
    public.products p ON gci.product_id = p.id
  WHERE 
    gci.guest_token = p_guest_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert a guest user to a registered user
CREATE OR REPLACE FUNCTION public.convert_guest_to_user(
  p_guest_token TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
DECLARE
  v_guest_cart_item RECORD;
  v_product_variation_id UUID;
BEGIN
  -- Set guest token for RLS policies
  PERFORM set_config('app.current_guest_token', p_guest_token, true);
  
  -- Transfer cart items from guest to user
  FOR v_guest_cart_item IN 
    SELECT product_id, quantity FROM public.guest_cart_items WHERE guest_token = p_guest_token
  LOOP
    -- Get the default product variation for this product
    SELECT id INTO v_product_variation_id
    FROM public.product_variations
    WHERE product_id = v_guest_cart_item.product_id
    LIMIT 1;
    
    IF v_product_variation_id IS NOT NULL THEN
      -- Add to user's cart
      INSERT INTO public.cart_items (user_id, product_variation_id, quantity)
      VALUES (p_user_id, v_product_variation_id, v_guest_cart_item.quantity)
      ON CONFLICT (user_id, product_variation_id) 
      DO UPDATE SET 
        quantity = cart_items.quantity + v_guest_cart_item.quantity,
        updated_at = now();
    END IF;
  END LOOP;
  
  -- Update any orders associated with this guest
  UPDATE public.orders
  SET 
    user_id = p_user_id,
    guest_token = NULL
  WHERE guest_token = p_guest_token;
  
  -- Delete guest cart items
  DELETE FROM public.guest_cart_items WHERE guest_token = p_guest_token;
  
  -- Delete guest user
  DELETE FROM public.guest_users WHERE guest_token = p_guest_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a guest user
CREATE OR REPLACE FUNCTION public.create_guest_user(
  p_guest_token TEXT,
  p_email TEXT DEFAULT NULL,
  p_first_name TEXT DEFAULT NULL,
  p_last_name TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_apartment TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
) RETURNS SETOF public.guest_users AS $$
BEGIN
  -- Set guest token for RLS policies
  PERFORM set_config('app.current_guest_token', p_guest_token, true);
  
  -- Insert or update guest user
  RETURN QUERY
  INSERT INTO public.guest_users (
    guest_token, 
    email, 
    first_name, 
    last_name, 
    address, 
    apartment, 
    city, 
    state, 
    postal_code, 
    country, 
    phone
  )
  VALUES (
    p_guest_token,
    p_email,
    p_first_name,
    p_last_name,
    p_address,
    p_apartment,
    p_city,
    p_state,
    p_postal_code,
    p_country,
    p_phone
  )
  ON CONFLICT (guest_token) 
  DO UPDATE SET 
    email = COALESCE(p_email, guest_users.email),
    first_name = COALESCE(p_first_name, guest_users.first_name),
    last_name = COALESCE(p_last_name, guest_users.last_name),
    address = COALESCE(p_address, guest_users.address),
    apartment = COALESCE(p_apartment, guest_users.apartment),
    city = COALESCE(p_city, guest_users.city),
    state = COALESCE(p_state, guest_users.state),
    postal_code = COALESCE(p_postal_code, guest_users.postal_code),
    country = COALESCE(p_country, guest_users.country),
    phone = COALESCE(p_phone, guest_users.phone),
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
