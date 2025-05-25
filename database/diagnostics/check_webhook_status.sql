-- Check if webhook processed the order correctly
-- Replace 'cs_test_b1RbXTmZaufYhiWDfTdcZSeFUuOiohfIqZWEGSBomevpzbmV8LnsWABxYD' with your actual session ID

-- Check if pending order exists
SELECT 
    id,
    stripe_session_id,
    created_at,
    expires_at
FROM pending_orders 
WHERE stripe_session_id = 'cs_test_b1RbXTmZaufYhiWDfTdcZSeFUuOiohfIqZWEGSBomevpzbmV8LnsWABxYD';

-- Check if order was created
SELECT 
    id,
    stripe_session_id,
    status,
    total_amount,
    created_at
FROM orders 
WHERE stripe_session_id = 'cs_test_b1RbXTmZaufYhiWDfTdcZSeFUuOiohfIqZWEGSBomevpzbmV8LnsWABxYD';

-- Check recent orders (last 10)
SELECT 
    id,
    stripe_session_id,
    status,
    total_amount,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
