/*
# Coupons and Product Variations Schema

1. New Tables
  - coupons
    - id (serial primary key) 
    - code (text unique)
    - discount_type (text)
    - discount_value (numeric)
    - min_amount (numeric)
    - start_date (timestamptz)
    - end_date (timestamptz)
    - applies_to (jsonb)
    - created_at (timestamptz)
    - updated_at (timestamptz)

  - product_variations
    - id (serial primary key)
    - product_id (references products)
    - variation_type (text) 
    - value (text)
    - additional_price (numeric)
    - created_at (timestamptz)
    - updated_at (timestamptz)

2. Security
  - Enable RLS
  - Add policies for authenticated users
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    min_amount NUMERIC(10,2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    applies_to JSONB DEFAULT '{"products": [], "categories": []}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_variations table
CREATE TABLE IF NOT EXISTS product_variations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variation_type TEXT NOT NULL,
    value TEXT NOT NULL,
    additional_price NUMERIC(10,2) DEFAULT 0 CHECK (additional_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Enable read access for all users" ON coupons
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON coupons
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON coupons
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON coupons
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for product_variations
CREATE POLICY "Enable read access for all users" ON product_variations
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON product_variations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON product_variations
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON product_variations
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_dates ON coupons(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_product_variations_product ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_type ON product_variations(variation_type);

-- Add triggers for updated_at
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variations_updated_at
    BEFORE UPDATE ON product_variations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();