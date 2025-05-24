-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  card_brand TEXT NOT NULL,
  card_last4 TEXT NOT NULL,
  card_exp_month INTEGER NOT NULL,
  card_exp_year INTEGER NOT NULL,
  billing_address JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_stripe_id_idx ON payment_methods(stripe_payment_method_id);

-- Add RLS policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own payment methods
CREATE POLICY payment_methods_select_user ON payment_methods
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own payment methods
CREATE POLICY payment_methods_insert_user ON payment_methods
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own payment methods
CREATE POLICY payment_methods_update_user ON payment_methods
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to delete their own payment methods
CREATE POLICY payment_methods_delete_user ON payment_methods
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to add a payment method
CREATE OR REPLACE FUNCTION add_payment_method(
  p_stripe_payment_method_id TEXT,
  p_card_brand TEXT,
  p_card_last4 TEXT,
  p_card_exp_month INTEGER,
  p_card_exp_year INTEGER,
  p_billing_address JSONB DEFAULT NULL,
  p_is_default BOOLEAN DEFAULT false
)
RETURNS SETOF payment_methods AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- If setting as default, unset any existing default
  IF p_is_default THEN
    UPDATE payment_methods
    SET 
      is_default = false,
      updated_at = now()
    WHERE user_id = v_user_id AND is_default = true;
  END IF;
  
  -- Insert new payment method
  RETURN QUERY
  INSERT INTO payment_methods (
    user_id,
    stripe_payment_method_id,
    card_brand,
    card_last4,
    card_exp_month,
    card_exp_year,
    billing_address,
    is_default
  )
  VALUES (
    v_user_id,
    p_stripe_payment_method_id,
    p_card_brand,
    p_card_last4,
    p_card_exp_month,
    p_card_exp_year,
    p_billing_address,
    p_is_default
  )
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set a payment method as default
CREATE OR REPLACE FUNCTION set_default_payment_method(
  p_payment_method_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_success BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Verify payment method belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM payment_methods
    WHERE id = p_payment_method_id AND user_id = v_user_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Unset any existing default
  UPDATE payment_methods
  SET 
    is_default = false,
    updated_at = now()
  WHERE user_id = v_user_id AND is_default = true;
  
  -- Set new default
  UPDATE payment_methods
  SET 
    is_default = true,
    updated_at = now()
  WHERE id = p_payment_method_id;
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  RETURN v_success > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a payment method
CREATE OR REPLACE FUNCTION delete_payment_method(
  p_payment_method_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_is_default BOOLEAN;
  v_success BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if payment method is default
  SELECT is_default INTO v_is_default
  FROM payment_methods
  WHERE id = p_payment_method_id AND user_id = v_user_id;
  
  -- Delete payment method
  DELETE FROM payment_methods
  WHERE id = p_payment_method_id AND user_id = v_user_id;
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  
  -- If deleted payment method was default, set a new default
  IF v_success AND v_is_default THEN
    UPDATE payment_methods
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
