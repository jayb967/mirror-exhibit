-- Temporarily disable RLS on cart_tracking to test cart conversion
-- This is for debugging purposes only

-- Disable RLS on cart_tracking table
ALTER TABLE cart_tracking DISABLE ROW LEVEL SECURITY;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    'RLS disabled for testing' as status
FROM pg_tables 
WHERE tablename IN ('cart_tracking', 'profiles')
AND schemaname = 'public';

-- Test message
SELECT 
    'RLS TEMPORARILY DISABLED' as message,
    'Cart conversion should now work without RLS issues' as details,
    'Remember to re-enable RLS after testing' as warning;
