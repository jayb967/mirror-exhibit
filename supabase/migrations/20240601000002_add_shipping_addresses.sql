-- Create shipping_addresses table if it doesn't exist
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Create index for faster lookup of user addresses
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);

-- Create index for default addresses
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_default ON shipping_addresses(user_id, is_default) WHERE is_default = true;

-- Create RLS policies for shipping_addresses table
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Policy for users to select their own addresses
CREATE POLICY select_own_addresses ON shipping_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to insert their own addresses
CREATE POLICY insert_own_addresses ON shipping_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own addresses
CREATE POLICY update_own_addresses ON shipping_addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own addresses
CREATE POLICY delete_own_addresses ON shipping_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated address is set as default
  IF NEW.is_default THEN
    -- Set all other addresses for this user to non-default
    UPDATE shipping_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one default address per user
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON shipping_addresses;
CREATE TRIGGER ensure_single_default_address_trigger
BEFORE INSERT OR UPDATE ON shipping_addresses
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_address();
