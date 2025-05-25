-- Check if the migration worked
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check specifically for user_id type
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
  AND column_name = 'user_id';

-- Check if add_to_cart function exists
SELECT 
    proname as function_name,
    oidvectortypes(proargtypes) as arguments
FROM pg_proc 
WHERE proname = 'add_to_cart';
