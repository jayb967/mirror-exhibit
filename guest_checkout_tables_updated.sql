-- Create extension for UUID generation if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create guest_users table
CREATE TABLE IF NOT EXISTS public.guest_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_token TEXT UNIQUE NOT NULL,
  email TEXT,
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

-- Add comment to guest_users table
COMMENT ON TABLE public.guest_users IS 'Stores information about guest users who checkout without creating an account';

-- Create guest_cart_items table
CREATE TABLE IF NOT EXISTS public.guest_cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_token TEXT NOT NULL REFERENCES public.guest_users(guest_token) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (guest_token, product_id)
);

-- Add comment to guest_cart_items table
COMMENT ON TABLE public.guest_cart_items IS 'Stores cart items for guest users';

-- Create index on guest_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_guest_cart_items_guest_token ON public.guest_cart_items(guest_token);

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_guest_cart_items_product_id ON public.guest_cart_items(product_id);

-- Modify orders table to support guest orders (if not already done)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS guest_token TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_id UUID REFERENCES public.shipping_addresses(id);

-- Add comment to explain guest fields in orders table
COMMENT ON COLUMN public.orders.guest_token IS 'Token to identify guest users';
COMMENT ON COLUMN public.orders.guest_email IS 'Email of guest user for order notifications';
COMMENT ON COLUMN public.orders.shipping_address_id IS 'Reference to shipping address for this order';

-- Create trigger to update updated_at timestamp for guest_users
CREATE OR REPLACE FUNCTION public.update_guest_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guest_users_updated_at
BEFORE UPDATE ON public.guest_users
FOR EACH ROW
EXECUTE FUNCTION public.update_guest_users_updated_at();

-- Create trigger to update updated_at timestamp for guest_cart_items
CREATE OR REPLACE FUNCTION public.update_guest_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guest_cart_items_updated_at
BEFORE UPDATE ON public.guest_cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_guest_cart_items_updated_at();

-- Add RLS (Row Level Security) policies for guest_users
ALTER TABLE public.guest_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a guest user (needed for guest checkout)
CREATE POLICY guest_users_insert_policy ON public.guest_users
FOR INSERT TO public
WITH CHECK (true);

-- Allow users to select their own guest data
CREATE POLICY guest_users_select_policy ON public.guest_users
FOR SELECT TO public
USING (guest_token = current_setting('app.current_guest_token', true)::text);

-- Allow users to update their own guest data
CREATE POLICY guest_users_update_policy ON public.guest_users
FOR UPDATE TO public
USING (guest_token = current_setting('app.current_guest_token', true)::text);

-- Add RLS policies for guest_cart_items
ALTER TABLE public.guest_cart_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a guest cart item (needed for guest checkout)
CREATE POLICY guest_cart_items_insert_policy ON public.guest_cart_items
FOR INSERT TO public
WITH CHECK (true);

-- Allow users to select their own guest cart items
CREATE POLICY guest_cart_items_select_policy ON public.guest_cart_items
FOR SELECT TO public
USING (guest_token = current_setting('app.current_guest_token', true)::text);

-- Allow users to update their own guest cart items
CREATE POLICY guest_cart_items_update_policy ON public.guest_cart_items
FOR UPDATE TO public
USING (guest_token = current_setting('app.current_guest_token', true)::text);

-- Allow users to delete their own guest cart items
CREATE POLICY guest_cart_items_delete_policy ON public.guest_cart_items
FOR DELETE TO public
USING (guest_token = current_setting('app.current_guest_token', true)::text);

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Allow admins to access all guest data
CREATE POLICY admin_guest_users_policy ON public.guest_users
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

CREATE POLICY admin_guest_cart_items_policy ON public.guest_cart_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Create function to add items to cart (needed for guest to user conversion)
CREATE OR REPLACE FUNCTION public.add_to_cart(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
) RETURNS SETOF public.cart_items AS $$
DECLARE
  v_product_variation_id UUID;
BEGIN
  -- Get the default product variation for this product
  SELECT id INTO v_product_variation_id
  FROM public.product_variations
  WHERE product_id = p_product_id
  LIMIT 1;
  
  -- If no product variation found, raise exception
  IF v_product_variation_id IS NULL THEN
    RAISE EXCEPTION 'No product variation found for product %', p_product_id;
  END IF;
  
  -- Insert or update cart item
  RETURN QUERY
  INSERT INTO public.cart_items (user_id, product_variation_id, quantity)
  VALUES (p_user_id, v_product_variation_id, p_quantity)
  ON CONFLICT (user_id, product_variation_id) 
  DO UPDATE SET 
    quantity = cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
