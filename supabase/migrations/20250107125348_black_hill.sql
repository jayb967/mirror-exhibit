/*
# Initial Schema Setup

1. Tables
  - categories
    - id (serial primary key) 
    - name (text, required)
    - slug (text, unique)
    - created_at (timestamptz)
    - updated_at (timestamptz)

  - products
    - id (serial primary key)
    - category_id (references categories)
    - name (text, required) 
    - description (text)
    - images (jsonb array of image URLs)
    - price (numeric, required)
    - created_at (timestamptz)
    - updated_at (timestamptz)

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Enable read access for all users" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON categories
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON categories
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for products
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();