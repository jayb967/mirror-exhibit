-- Check Missing Tables and Functions
-- Run this in Supabase SQL Editor to see what's missing

-- 1. Check which tables exist
SELECT 
    'Table Status' as check_type,
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
        ('products'),
        ('product_variations'),
        ('product_images'),
        ('cart_items'),
        ('cart_tracking'),
        ('guest_users'),
        ('guest_cart_items'),
        ('product_analytics'),
        ('orders'),
        ('order_items')
) AS expected_tables(table_name)
LEFT JOIN information_schema.tables t 
    ON t.table_name = expected_tables.table_name 
    AND t.table_schema = 'public'
ORDER BY expected_tables.table_name;

-- 2. Check which functions exist
SELECT 
    'Function Status' as check_type,
    routine_name as function_name,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
        ('create_anonymous_guest_user'),
        ('add_to_cart'),
        ('update_cart_quantity'),
        ('add_to_guest_cart_with_variation'),
        ('update_guest_cart_quantity'),
        ('convert_guest_to_user'),
        ('get_guest_cart_with_products_enhanced')
) AS expected_functions(routine_name)
LEFT JOIN information_schema.routines r 
    ON r.routine_name = expected_functions.routine_name 
    AND r.routine_schema = 'public'
ORDER BY expected_functions.routine_name;

-- 3. Check products table structure (should exist)
SELECT 
    'Products Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if products have stock_quantity column
SELECT 
    'Stock Column Check' as check_type,
    CASE 
        WHEN column_name = 'stock_quantity' THEN '⚠️ STOCK COLUMN EXISTS (should be removed for made-to-order)'
        ELSE 'No stock column found (good for made-to-order)'
    END as status
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
AND column_name = 'stock_quantity'
UNION ALL
SELECT 
    'Stock Column Check' as check_type,
    'No stock column found (good for made-to-order)' as status
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND table_schema = 'public'
    AND column_name = 'stock_quantity'
);

-- 5. Summary of what was intentionally removed
SELECT 
    'Intentionally Removed' as check_type,
    item_name,
    reason
FROM (
    VALUES 
        ('guest_users table', 'Replaced by cart_tracking table'),
        ('guest_cart_items table', 'Replaced by cart_tracking.cart_items JSONB'),
        ('create_anonymous_guest_user function', 'No longer needed without guest_users table'),
        ('stock_quantity validation', 'Products are made-to-order, no inventory limits'),
        ('stock reduction on add to cart', 'Stock only reduces when order is placed')
) AS removed_items(item_name, reason);

-- 6. What should exist for the app to work fully
SELECT 
    'Required for Full Functionality' as check_type,
    item_name,
    priority,
    description
FROM (
    VALUES 
        ('products table', 'HIGH', 'Core product data'),
        ('product_variations table', 'HIGH', 'Product size/frame combinations'),
        ('cart_tracking table', 'MEDIUM', 'Guest cart persistence and analytics'),
        ('product_analytics table', 'LOW', 'User interaction tracking'),
        ('cart_items table', 'MEDIUM', 'Authenticated user carts'),
        ('orders table', 'HIGH', 'Order processing'),
        ('order_items table', 'HIGH', 'Order line items')
) AS required_items(item_name, priority, description)
ORDER BY 
    CASE priority 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'LOW' THEN 3 
    END;

-- 7. Current app behavior without missing tables
SELECT 
    'App Behavior Without Tables' as check_type,
    missing_table,
    fallback_behavior
FROM (
    VALUES 
        ('cart_tracking', 'Uses local storage only for guest carts'),
        ('product_analytics', 'Analytics tracking fails silently'),
        ('guest_users', 'Not needed - was intentionally removed'),
        ('guest_cart_items', 'Not needed - was intentionally removed'),
        ('cart_items', 'Uses local storage for all carts'),
        ('orders', 'Checkout will fail - needs to be created'),
        ('order_items', 'Order processing will fail - needs to be created')
) AS fallback_info(missing_table, fallback_behavior);

-- 8. Recommendations
SELECT 
    'Recommendations' as check_type,
    action,
    priority,
    description
FROM (
    VALUES 
        ('Remove stock_quantity column', 'HIGH', 'Products are made-to-order, no inventory tracking needed'),
        ('Create orders/order_items tables', 'HIGH', 'Required for checkout functionality'),
        ('Set up product_analytics RLS', 'MEDIUM', 'Run setup_analytics_rls.sql for user tracking'),
        ('Create cart_tracking table', 'MEDIUM', 'For guest cart persistence and recovery'),
        ('Remove stock validation code', 'HIGH', 'Already done - no stock limits for made-to-order')
) AS recommendations(action, priority, description)
ORDER BY 
    CASE priority 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'LOW' THEN 3 
    END;
