-- Debug cart_tracking table structure and check for existing functions
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check cart_tracking table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cart_tracking' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if the function exists
SELECT 
    routine_name, 
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'merge_guest_cart_with_user' 
AND routine_schema = 'public';

-- 3. Check all functions that contain 'merge' or 'guest'
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (routine_name LIKE '%merge%' OR routine_name LIKE '%guest%')
ORDER BY routine_name;

-- 4. Check sample data from cart_tracking to see actual data types
SELECT 
    id,
    user_id,
    guest_token,
    pg_typeof(user_id) as user_id_type,
    pg_typeof(guest_token) as guest_token_type
FROM cart_tracking 
LIMIT 3;
