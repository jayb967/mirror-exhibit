-- Clean up unused guest tables since cart_tracking is handling guest functionality
-- This migration removes tables that are no longer needed

-- Drop guest_cart_items table if it exists
DROP TABLE IF EXISTS guest_cart_items CASCADE;

-- Drop guest_users table if it exists  
DROP TABLE IF EXISTS guest_users CASCADE;

-- Remove any functions that reference these tables
DROP FUNCTION IF EXISTS create_anonymous_guest_user(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS convert_guest_to_clerk_user(TEXT, TEXT) CASCADE;

-- Clean up any indexes that might have been created for these tables
DROP INDEX IF EXISTS idx_guest_users_guest_token;
DROP INDEX IF EXISTS idx_guest_users_user_id;
DROP INDEX IF EXISTS idx_guest_cart_items_guest_token;
DROP INDEX IF EXISTS idx_guest_cart_items_product_id;

-- Note: cart_tracking table handles all guest functionality now
-- - Guest tokens are stored in cart_tracking.guest_token
-- - Cart items are stored in cart_tracking.cart_items (JSONB)
-- - Guest user data can be stored in cart_tracking fields as needed
