-- Add FAQ management to site_settings table
-- This migration adds FAQ storage capability to the existing site_settings table

-- Add FAQ columns to site_settings table
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS product_faqs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS general_faqs JSONB DEFAULT '[]'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN site_settings.product_faqs IS 'FAQs displayed on product detail pages - array of {id, question, answer, sort_order}';
COMMENT ON COLUMN site_settings.general_faqs IS 'FAQs displayed on general FAQ page - array of {id, question, answer, sort_order}';

-- Insert default FAQ data if site_settings table is empty
INSERT INTO site_settings (
  product_faqs,
  general_faqs,
  store_name,
  store_email,
  store_phone,
  tax_enabled,
  tax_rate,
  free_shipping_threshold
)
SELECT
  '[
    {
      "id": "1",
      "question": "How do I install this mirror?",
      "answer": "Installation is simple and straightforward. Each mirror comes with mounting hardware and detailed instructions. For larger mirrors, we recommend professional installation to ensure safety and proper mounting.",
      "sort_order": 1
    },
    {
      "id": "2",
      "question": "What is your return policy?",
      "answer": "We offer a 30-day return policy for all mirrors. Items must be in original condition and packaging. Return shipping costs may apply unless the item is defective.",
      "sort_order": 2
    },
    {
      "id": "3",
      "question": "How should I clean and maintain my mirror?",
      "answer": "Use a soft, lint-free cloth with glass cleaner or a mixture of water and vinegar. Avoid abrasive cleaners or rough materials that could scratch the surface. Clean regularly to maintain clarity and prevent buildup.",
      "sort_order": 3
    }
  ]'::jsonb,
  '[
    {
      "id": "1",
      "question": "How effectively small spaces in interior design?",
      "answer": "Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper",
      "sort_order": 1
    },
    {
      "id": "2",
      "question": "How to functional and stylish home office?",
      "answer": "Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper",
      "sort_order": 2
    },
    {
      "id": "3",
      "question": "What services do you offer?",
      "answer": "Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper",
      "sort_order": 3
    },
    {
      "id": "4",
      "question": "How to get right furniture for my interior?",
      "answer": "Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper",
      "sort_order": 4
    }
  ]'::jsonb,
  'Mirror Exhibit',
  'info@mirrorexhibit.com',
  '555-123-4567',
  true,
  0.0875,
  100.00
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- Update existing settings with default FAQ data if FAQ columns are empty
UPDATE site_settings
SET
  product_faqs = '[
    {
      "id": "1",
      "question": "How do I install this mirror?",
      "answer": "Installation is simple and straightforward. Each mirror comes with mounting hardware and detailed instructions. For larger mirrors, we recommend professional installation to ensure safety and proper mounting.",
      "sort_order": 1
    },
    {
      "id": "2",
      "question": "What is your return policy?",
      "answer": "We offer a 30-day return policy for all mirrors. Items must be in original condition and packaging. Return shipping costs may apply unless the item is defective.",
      "sort_order": 2
    },
    {
      "id": "3",
      "question": "How should I clean and maintain my mirror?",
      "answer": "Use a soft, lint-free cloth with glass cleaner or a mixture of water and vinegar. Avoid abrasive cleaners or rough materials that could scratch the surface. Clean regularly to maintain clarity and prevent buildup.",
      "sort_order": 3
    }
  ]'::jsonb,
  general_faqs = '[
    {
      "id": "1",
      "question": "How effectively small spaces in interior design?",
      "answer": "Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper",
      "sort_order": 1
    },
    {
      "id": "2",
      "question": "How to functional and stylish home office?",
      "answer": "Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper",
      "sort_order": 2
    },
    {
      "id": "3",
      "question": "What services do you offer?",
      "answer": "Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper",
      "sort_order": 3
    },
    {
      "id": "4",
      "question": "How to get right furniture for my interior?",
      "answer": "Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper",
      "sort_order": 4
    }
  ]'::jsonb
WHERE (product_faqs IS NULL OR product_faqs = '[]'::jsonb)
   OR (general_faqs IS NULL OR general_faqs = '[]'::jsonb);
