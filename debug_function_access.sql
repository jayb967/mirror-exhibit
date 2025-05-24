-- Debug function accessibility and permissions
-- Run this to see what's happening with the function

-- 1. Check if function exists
SELECT 
    'FUNCTION EXISTS CHECK' as section,
    routine_name,
    routine_type,
    routine_schema,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'merge_guest_cart_with_user';

-- 2. Check function permissions
SELECT 
    'FUNCTION PERMISSIONS' as section,
    routine_name,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges 
WHERE routine_name = 'merge_guest_cart_with_user';

-- 3. Check if there are any other functions with similar names
SELECT 
    'SIMILAR FUNCTIONS' as section,
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_name LIKE '%merge%' OR routine_name LIKE '%guest%'
ORDER BY routine_name;

-- 4. Check the exact function signature
SELECT 
    'FUNCTION SIGNATURE' as section,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as security_definer,
    p.proacl as permissions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'merge_guest_cart_with_user'
AND n.nspname = 'public';

-- 5. Test if we can call the function directly (not via RPC)
SELECT 
    'DIRECT FUNCTION TEST' as section,
    'Testing function with dummy data' as test,
    merge_guest_cart_with_user('test_token_that_does_not_exist', 'test_user_id') as result;
