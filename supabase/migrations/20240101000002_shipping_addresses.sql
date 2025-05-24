-- Create shipping_addresses table
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  apartment TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS shipping_addresses_user_id_idx ON shipping_addresses(user_id);

-- Add RLS policies
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own shipping addresses
CREATE POLICY shipping_addresses_select_user ON shipping_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own shipping addresses
CREATE POLICY shipping_addresses_insert_user ON shipping_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own shipping addresses
CREATE POLICY shipping_addresses_update_user ON shipping_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own shipping addresses
CREATE POLICY shipping_addresses_delete_user ON shipping_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to add a shipping address
CREATE OR REPLACE FUNCTION add_shipping_address(
  p_first_name TEXT,
  p_last_name TEXT,
  p_address TEXT,
  p_apartment TEXT DEFAULT NULL,
  p_city TEXT,
  p_state TEXT,
  p_postal_code TEXT,
  p_country TEXT,
  p_phone TEXT,
  p_is_default BOOLEAN DEFAULT false
)
RETURNS SETOF shipping_addresses AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- If setting as default, unset any existing default
  IF p_is_default THEN
    UPDATE shipping_addresses
    SET 
      is_default = false,
      updated_at = now()
    WHERE user_id = v_user_id AND is_default = true;
  END IF;
  
  -- Insert new shipping address
  RETURN QUERY
  INSERT INTO shipping_addresses (
    user_id,
    first_name,
    last_name,
    address,
    apartment,
    city,
    state,
    postal_code,
    country,
    phone,
    is_default
  )
  VALUES (
    v_user_id,
    p_first_name,
    p_last_name,
    p_address,
    p_apartment,
    p_city,
    p_state,
    p_postal_code,
    p_country,
    p_phone,
    p_is_default
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set a shipping address as default
CREATE OR REPLACE FUNCTION set_default_shipping_address(
  p_address_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_success BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Verify address belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM shipping_addresses
    WHERE id = p_address_id AND user_id = v_user_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Unset any existing default
  UPDATE shipping_addresses
  SET 
    is_default = false,
    updated_at = now()
  WHERE user_id = v_user_id AND is_default = true;
  
  -- Set new default
  UPDATE shipping_addresses
  SET 
    is_default = true,
    updated_at = now()
  WHERE id = p_address_id;
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a shipping address
CREATE OR REPLACE FUNCTION delete_shipping_address(
  p_address_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_is_default BOOLEAN;
  v_success BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if address is default
  SELECT is_default INTO v_is_default
  FROM shipping_addresses
  WHERE id = p_address_id AND user_id = v_user_id;
  
  -- Delete address
  DELETE FROM shipping_addresses
  WHERE id = p_address_id AND user_id = v_user_id;
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  
  -- If deleted address was default, set a new default
  IF v_success AND v_is_default THEN
    UPDATE shipping_addresses
    SET 
      is_default = true,
      updated_at = now()
    WHERE user_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
