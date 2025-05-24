-- Update guest tables to use anonymous authentication for better security
-- This migration updates the guest system to use Supabase anonymous users

-- Step 1: Add user_id column to guest_users table to link with auth.users
ALTER TABLE public.guest_users
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Add user_id column to guest_cart_items table
ALTER TABLE public.guest_cart_items
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Update cart_tracking table to better support anonymous users
ALTER TABLE public.cart_tracking
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Step 4: Drop old permissive RLS policies
DROP POLICY IF EXISTS "Guest users can be read by anyone with the token" ON guest_users;
DROP POLICY IF EXISTS "Guest users can be inserted by anyone" ON guest_users;
DROP POLICY IF EXISTS "Guest users can be updated by anyone with the token" ON guest_users;

DROP POLICY IF EXISTS "Guest cart items can be read by anyone with the token" ON guest_cart_items;
DROP POLICY IF EXISTS "Guest cart items can be inserted by anyone" ON guest_cart_items;
DROP POLICY IF EXISTS "Guest cart items can be updated by anyone with the token" ON guest_cart_items;
DROP POLICY IF EXISTS "Guest cart items can be deleted by anyone with the token" ON guest_cart_items;

-- Step 5: Create secure RLS policies for anonymous users
-- Guest users policies
CREATE POLICY "Anonymous users can read their own guest data" ON guest_users
  FOR SELECT TO anon, authenticated
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND guest_token = current_setting('app.guest_token', true))
  );

CREATE POLICY "Anonymous users can insert their own guest data" ON guest_users
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL)
  );

CREATE POLICY "Anonymous users can update their own guest data" ON guest_users
  FOR UPDATE TO anon, authenticated
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND guest_token = current_setting('app.guest_token', true))
  );

-- Guest cart items policies
CREATE POLICY "Anonymous users can read their own cart items" ON guest_cart_items
  FOR SELECT TO anon, authenticated
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND guest_token = current_setting('app.guest_token', true))
  );

CREATE POLICY "Anonymous users can insert their own cart items" ON guest_cart_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL)
  );

CREATE POLICY "Anonymous users can update their own cart items" ON guest_cart_items
  FOR UPDATE TO anon, authenticated
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND guest_token = current_setting('app.guest_token', true))
  );

CREATE POLICY "Anonymous users can delete their own cart items" ON guest_cart_items
  FOR DELETE TO anon, authenticated
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (auth.uid() IS NULL AND guest_token = current_setting('app.guest_token', true))
  );

-- Step 6: Update functions to support anonymous users
CREATE OR REPLACE FUNCTION public.add_to_guest_cart_with_variation_anon(
  p_guest_token TEXT,
  p_product_id UUID,
  p_quantity INTEGER,
  p_product_variation_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS SETOF public.guest_cart_items AS $$
BEGIN
  -- Insert or update cart item with variation support
  RETURN QUERY
  INSERT INTO public.guest_cart_items (
    guest_token,
    product_id,
    quantity,
    product_variation_id,
    user_id
  )
  VALUES (
    p_guest_token,
    p_product_id,
    p_quantity,
    p_product_variation_id,
    COALESCE(p_user_id, auth.uid())
  )
  ON CONFLICT (guest_token, product_id, product_variation_id)
  DO UPDATE SET
    quantity = guest_cart_items.quantity + p_quantity,
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Update guest cart retrieval function
CREATE OR REPLACE FUNCTION public.get_guest_cart_with_products_enhanced_anon(
  p_guest_token TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  guest_token TEXT,
  product_id UUID,
  quantity INTEGER,
  product_variation_id UUID,
  user_id UUID,
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
    c.user_id,
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
    AND (
      (p_user_id IS NOT NULL AND c.user_id = p_user_id) OR
      (p_user_id IS NULL AND (c.user_id IS NULL OR c.user_id = auth.uid()))
    )
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Function to convert anonymous user to authenticated user
CREATE OR REPLACE FUNCTION public.convert_anonymous_to_authenticated(
  p_guest_token TEXT,
  p_old_user_id UUID,
  p_new_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Update guest_users table
  UPDATE public.guest_users
  SET user_id = p_new_user_id
  WHERE guest_token = p_guest_token AND user_id = p_old_user_id;

  -- Update guest_cart_items table
  UPDATE public.guest_cart_items
  SET user_id = p_new_user_id
  WHERE guest_token = p_guest_token AND user_id = p_old_user_id;

  -- Update cart_tracking table
  UPDATE public.cart_tracking
  SET
    user_id = p_new_user_id,
    is_anonymous = false
  WHERE guest_token = p_guest_token AND user_id = p_old_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Function to create anonymous user session
CREATE OR REPLACE FUNCTION public.create_anonymous_guest_user(
  p_guest_token TEXT,
  p_user_id UUID,
  p_email TEXT DEFAULT NULL
) RETURNS SETOF public.guest_users AS $$
BEGIN
  RETURN QUERY
  INSERT INTO public.guest_users (
    guest_token,
    user_id,
    email
  )
  VALUES (
    p_guest_token,
    p_user_id,
    p_email
  )
  ON CONFLICT (guest_token)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    email = COALESCE(EXCLUDED.email, guest_users.email),
    updated_at = now()
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Add comments for clarity
COMMENT ON COLUMN public.guest_users.user_id IS 'References auth.users.id for anonymous or authenticated users';
COMMENT ON COLUMN public.guest_cart_items.user_id IS 'References auth.users.id for anonymous or authenticated users';
COMMENT ON COLUMN public.cart_tracking.is_anonymous IS 'Indicates if this cart belongs to an anonymous user';

-- Step 11: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_guest_users_user_id ON public.guest_users(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_cart_items_user_id ON public.guest_cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_user_id_anonymous ON public.cart_tracking(user_id, is_anonymous);

-- Step 12: Cleanup functions for anonymous users
-- Function to clean up old anonymous user sessions (older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_anonymous_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set cutoff date to 30 days ago
  v_cutoff_date := now() - INTERVAL '30 days';

  -- Delete old anonymous user sessions and related data
  WITH deleted_users AS (
    DELETE FROM public.guest_users
    WHERE created_at < v_cutoff_date
      AND user_id IN (
        SELECT id FROM auth.users
        WHERE is_anonymous = true
          AND created_at < v_cutoff_date
      )
    RETURNING user_id
  ),
  deleted_cart_items AS (
    DELETE FROM public.guest_cart_items
    WHERE user_id IN (SELECT user_id FROM deleted_users)
    RETURNING id
  ),
  deleted_cart_tracking AS (
    DELETE FROM public.cart_tracking
    WHERE user_id IN (SELECT user_id FROM deleted_users)
      AND is_anonymous = true
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_users;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up abandoned anonymous carts (no activity for 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_anonymous_carts()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set cutoff date to 7 days ago
  v_cutoff_date := now() - INTERVAL '7 days';

  -- Delete abandoned cart items for anonymous users
  WITH deleted_cart_items AS (
    DELETE FROM public.guest_cart_items
    WHERE updated_at < v_cutoff_date
      AND user_id IN (
        SELECT id FROM auth.users
        WHERE is_anonymous = true
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted_cart_items;

  -- Update cart tracking to mark as abandoned
  UPDATE public.cart_tracking
  SET
    cart_items = '[]'::jsonb,
    subtotal = 0,
    last_activity = now()
  WHERE last_activity < v_cutoff_date
    AND is_anonymous = true
    AND checkout_completed = false;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to merge anonymous user data when converting to authenticated
CREATE OR REPLACE FUNCTION public.merge_anonymous_to_authenticated(
  p_anonymous_user_id UUID,
  p_authenticated_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Update guest_users table
  UPDATE public.guest_users
  SET user_id = p_authenticated_user_id
  WHERE user_id = p_anonymous_user_id;

  -- Merge cart items (handle duplicates by updating quantities)
  INSERT INTO public.guest_cart_items (
    guest_token, product_id, quantity, product_variation_id, user_id, created_at, updated_at
  )
  SELECT
    guest_token, product_id, quantity, product_variation_id, p_authenticated_user_id, created_at, updated_at
  FROM public.guest_cart_items
  WHERE user_id = p_anonymous_user_id
  ON CONFLICT (guest_token, product_id, product_variation_id)
  DO UPDATE SET
    quantity = guest_cart_items.quantity + EXCLUDED.quantity,
    updated_at = now();

  -- Delete old anonymous cart items
  DELETE FROM public.guest_cart_items WHERE user_id = p_anonymous_user_id;

  -- Update cart_tracking table
  UPDATE public.cart_tracking
  SET
    user_id = p_authenticated_user_id,
    is_anonymous = false
  WHERE user_id = p_anonymous_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup functions (requires pg_cron extension)
-- This is optional and should be enabled by database admin
/*
-- Clean up old anonymous sessions daily at 2 AM
SELECT cron.schedule('cleanup-anonymous-sessions', '0 2 * * *', 'SELECT public.cleanup_old_anonymous_sessions();');

-- Clean up abandoned carts every 6 hours
SELECT cron.schedule('cleanup-abandoned-carts', '0 */6 * * *', 'SELECT public.cleanup_abandoned_anonymous_carts();');
*/

-- Add comments for the cleanup functions
COMMENT ON FUNCTION public.cleanup_old_anonymous_sessions() IS 'Cleans up anonymous user sessions older than 30 days';
COMMENT ON FUNCTION public.cleanup_abandoned_anonymous_carts() IS 'Cleans up abandoned cart items for anonymous users (no activity for 7 days)';
COMMENT ON FUNCTION public.merge_anonymous_to_authenticated(UUID, UUID) IS 'Merges anonymous user data when converting to authenticated user';
