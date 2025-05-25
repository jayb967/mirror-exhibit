# Database Migrations for Brands and Tags Feature

This folder contains SQL migration files to add brands and tags functionality to the Mirror Exhibit database.

## Migration Order

**IMPORTANT:** Run these files in the exact order listed below:

1. `001_create_brands_table.sql` - Updates existing brands table with new columns
2. `002_create_tags_table.sql` - Creates the tags table
3. `003_create_product_tags_table.sql` - Creates the product-tags junction table
4. `004_add_brand_to_products.sql` - Ensures brand relationships and creates views
5. `005_create_indexes_and_functions.sql` - Creates performance indexes and utility functions
6. `006_update_complete_views.sql` - Updates views to include tags after all tables exist

## How to Run

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste each file's content in order
4. Run each migration one at a time
5. Verify no errors before proceeding to the next file

## What Each Migration Does

### 001_create_brands_table.sql
- Updates existing `brands` table with new columns (slug, website_url, created_by)
- Generates slugs for existing brands
- Adds indexes for performance
- Inserts 10 additional default brands to get started
- Uses TEXT for created_by (Clerk user ID)
- Works with your existing brands table structure

### 002_create_tags_table.sql
- Creates `tags` table for storing tag information (luxury, motivation, etc.)
- Includes fields: name, slug, description, color, category
- Organizes tags by category: fashion, emotion, style, theme
- Inserts 23 default tags with color coding
- Uses TEXT for created_by (Clerk user ID)

### 003_create_product_tags_table.sql
- Creates `product_tags` junction table for many-to-many relationship
- Links products to multiple tags
- Creates helpful views: `products_with_tags`, `tags_with_product_counts`
- Uses TEXT for assigned_by (Clerk user ID)

### 004_add_brand_to_products.sql
- Ensures proper foreign key constraints for existing `brand_id` column
- Creates helpful views: `products_with_brands`, `brands_with_product_counts`, `products_complete`
- Works with your existing products table structure

### 005_create_indexes_and_functions.sql
- Creates performance indexes for common queries
- Adds full-text search indexes
- Creates utility functions for searching and filtering
- Adds data validation functions

### 006_update_complete_views.sql
- Updates the `products_complete` view to include tags
- Creates enhanced search views and functions
- Should be run after all other migrations are complete

## Default Data Included

### Brands (10 brands):
- Rolex, BMW, Nike, Apple, Coca-Cola
- Ferrari, Chanel, Mercedes-Benz, Louis Vuitton, Tesla

### Tags (23 tags organized by category):

**Fashion (5 tags):**
- Luxury (#FFD700), Vintage (#8B4513), Modern (#2F4F4F)
- Minimalist (#708090), Elegant (#4B0082)

**Emotion (5 tags):**
- Motivation (#FF6347), Humor (#32CD32), Inspiration (#FF69B4)
- Calm (#87CEEB), Energy (#FF4500)

**Style (5 tags):**
- Bold (#DC143C), Subtle (#D3D3D3), Artistic (#9370DB)
- Professional (#2F4F4F), Casual (#20B2AA)

**Theme (8 tags):**
- Sports (#228B22), Cars (#FF8C00), Nature (#8FBC8F)
- Technology (#4169E1), Travel (#DAA520), Music (#9932CC)
- Art (#FF1493), Fashion (#FF69B4)

## Useful Views Created

After running all migrations, you'll have these helpful views:

- `products_with_brands` - Products with brand information
- `products_with_tags` - Products with their tags
- `products_complete` - Products with brands, categories, and tags
- `brands_with_product_counts` - Brands with product counts
- `tags_with_product_counts` - Tags with product counts

## Utility Functions Created

- `search_products(text)` - Full-text search with relevance scoring
- `get_products_with_all_tags(uuid[])` - Products with ALL specified tags
- `get_products_with_any_tags(uuid[])` - Products with ANY specified tags
- `get_tag_suggestions(text)` - Tag autocomplete suggestions
- `get_brand_suggestions(text)` - Brand autocomplete suggestions
- `generate_slug(text)` - Generate URL-friendly slugs

## Verification Queries

After running all migrations, test with these queries:

```sql
-- Check brands
SELECT * FROM brands_with_product_counts;

-- Check tags by category
SELECT * FROM tags_with_product_counts ORDER BY category, name;

-- Check the complete products view
SELECT * FROM products_complete LIMIT 5;

-- Test search function
SELECT * FROM search_products('luxury') LIMIT 10;
```

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Remove views
DROP VIEW IF EXISTS products_complete;
DROP VIEW IF EXISTS products_with_brands;
DROP VIEW IF EXISTS products_with_tags;
DROP VIEW IF EXISTS brands_with_product_counts;
DROP VIEW IF EXISTS tags_with_product_counts;

-- Remove foreign key and column
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_brand_id;
ALTER TABLE products DROP COLUMN IF EXISTS brand_id;

-- Drop tables (in reverse order)
DROP TABLE IF EXISTS product_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS brands;
```

## Next Steps

After running these migrations:

1. Create API endpoints for brands and tags
2. Build admin interfaces for managing brands and tags
3. Update product management to include brand and tag assignment
4. Enhance shop page filtering with brands and tags
5. Update search functionality to include brands and tags
