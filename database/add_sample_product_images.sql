-- Add sample product images for testing multi-image functionality
-- This script adds multiple images to existing products to test the image gallery

-- First, let's get a product ID to work with
-- We'll use the product with ID '8f52d38a-631a-4767-baaf-c16f07958da4' that we've been testing

-- Add multiple images for the test product
INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text)
VALUES 
  -- Main product image (primary)
  ('8f52d38a-631a-4767-baaf-c16f07958da4', 'https://res.cloudinary.com/dhmqlhfn3/image/upload/v1747372465/product-images/1747372465178-66mbur1ie3.png', true, 1, 'You Got This Edition 1 - Main View'),
  
  -- Additional product images
  ('8f52d38a-631a-4767-baaf-c16f07958da4', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=800&fit=crop', false, 2, 'You Got This Edition 1 - Side View'),
  
  ('8f52d38a-631a-4767-baaf-c16f07958da4', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop', false, 3, 'You Got This Edition 1 - Detail View'),
  
  ('8f52d38a-631a-4767-baaf-c16f07958da4', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=800&fit=crop&auto=format', false, 4, 'You Got This Edition 1 - Installation View'),
  
  ('8f52d38a-631a-4767-baaf-c16f07958da4', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&auto=format', false, 5, 'You Got This Edition 1 - Room Setting')
ON CONFLICT (product_id, image_url) DO NOTHING;

-- Add images for another product if it exists
-- Let's find another product and add images to it
DO $$
DECLARE
    other_product_id UUID;
BEGIN
    -- Get another product ID (not the test one)
    SELECT id INTO other_product_id 
    FROM products 
    WHERE id != '8f52d38a-631a-4767-baaf-c16f07958da4' 
    LIMIT 1;
    
    -- If we found another product, add images to it
    IF other_product_id IS NOT NULL THEN
        INSERT INTO product_images (product_id, image_url, is_primary, sort_order, alt_text)
        VALUES 
          (other_product_id, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop', true, 1, 'Product Main View'),
          (other_product_id, 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=800&fit=crop', false, 2, 'Product Side View'),
          (other_product_id, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&auto=format', false, 3, 'Product Detail View')
        ON CONFLICT (product_id, image_url) DO NOTHING;
    END IF;
END $$;

-- Verify the images were added
SELECT 
    p.name as product_name,
    pi.image_url,
    pi.is_primary,
    pi.sort_order,
    pi.alt_text
FROM product_images pi
JOIN products p ON pi.product_id = p.id
WHERE pi.product_id = '8f52d38a-631a-4767-baaf-c16f07958da4'
ORDER BY pi.sort_order;

-- Show total count of product images
SELECT 
    COUNT(*) as total_product_images,
    COUNT(DISTINCT product_id) as products_with_images
FROM product_images;
