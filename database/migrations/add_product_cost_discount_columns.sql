-- Add cost and discount_price columns to products table
-- These columns are needed for admin product management

-- Add cost column (what it costs to make/buy the product)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2);

-- Add discount_price column (sale price when on discount)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10, 2);

-- Add comments for clarity
COMMENT ON COLUMN products.cost IS 'Cost to make or purchase this product (for profit calculations)';
COMMENT ON COLUMN products.discount_price IS 'Sale price when product is on discount (optional)';

-- Update any existing products to have is_active = true by default if null
UPDATE products 
SET is_active = true 
WHERE is_active IS NULL;

-- Ensure is_active has a default value for new products
ALTER TABLE products 
ALTER COLUMN is_active SET DEFAULT true;
