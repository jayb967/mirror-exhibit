-- =====================================================
-- CLERK COMPATIBILITY FIX
-- Updates the schema to work with Clerk authentication instead of Supabase auth
-- Run this after the other migrations if you're using Clerk
-- =====================================================

-- STEP 1: Drop all RLS policies first (they prevent column type changes)
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

DROP POLICY IF EXISTS "Users can manage their own preferences" ON notification_preferences;

DROP POLICY IF EXISTS "Users can view their own stripe customer data" ON stripe_customers;
DROP POLICY IF EXISTS "Admins can manage all stripe customers" ON stripe_customers;

DROP POLICY IF EXISTS "Users can view their own payment intents" ON stripe_payment_intents;
DROP POLICY IF EXISTS "Admins can manage all payment intents" ON stripe_payment_intents;

DROP POLICY IF EXISTS "Users can view their order tracking events" ON shipping_tracking_events;
DROP POLICY IF EXISTS "Admins can manage all tracking events" ON shipping_tracking_events;

DROP POLICY IF EXISTS "Users can manage their own addresses" ON customer_addresses;

DROP POLICY IF EXISTS "Users can view their own returns" ON order_returns;
DROP POLICY IF EXISTS "Users can create returns for their orders" ON order_returns;
DROP POLICY IF EXISTS "Admins can manage all returns" ON order_returns;

DROP POLICY IF EXISTS "Users can view customer-visible notes for their orders" ON order_notes;
DROP POLICY IF EXISTS "Admins can manage all order notes" ON order_notes;

DROP POLICY IF EXISTS "Users can view their order status history" ON order_status_history;
DROP POLICY IF EXISTS "Admins can manage all order status history" ON order_status_history;

-- STEP 2: Drop foreign key constraints that reference auth.users
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE stripe_customers DROP CONSTRAINT IF EXISTS stripe_customers_user_id_fkey;
ALTER TABLE customer_addresses DROP CONSTRAINT IF EXISTS customer_addresses_user_id_fkey;
ALTER TABLE order_fulfillment DROP CONSTRAINT IF EXISTS order_fulfillment_assigned_to_fkey;
ALTER TABLE order_returns DROP CONSTRAINT IF EXISTS order_returns_processed_by_fkey;
ALTER TABLE order_notes DROP CONSTRAINT IF EXISTS order_notes_created_by_fkey;
ALTER TABLE order_status_history DROP CONSTRAINT IF EXISTS order_status_history_changed_by_fkey;
ALTER TABLE stripe_price_history DROP CONSTRAINT IF EXISTS stripe_price_history_changed_by_fkey;

-- STEP 3: Now update column types to TEXT for Clerk user IDs
ALTER TABLE orders ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE notification_preferences ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE stripe_customers ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE customer_addresses ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE order_fulfillment ALTER COLUMN assigned_to TYPE TEXT;
ALTER TABLE order_returns ALTER COLUMN processed_by TYPE TEXT;
ALTER TABLE order_notes ALTER COLUMN created_by TYPE TEXT;
ALTER TABLE order_status_history ALTER COLUMN changed_by TYPE TEXT;
ALTER TABLE stripe_price_history ALTER COLUMN changed_by TYPE TEXT;

-- STEP 4: Disable RLS for user tables since we'll handle authentication at the application level with Clerk
-- You can re-enable and create custom policies later if needed

-- Disable RLS for now since we'll handle authentication at the application level with Clerk
-- You can re-enable and create custom policies later if needed
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payment_intents DISABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_tracking_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_returns DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled for admin-only tables
-- ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY; (already enabled)
-- ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY; (already enabled)
-- ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY; (already enabled)
-- etc.

-- Update indexes to work with TEXT user_id
DROP INDEX IF EXISTS idx_orders_user_id;
CREATE INDEX idx_orders_user_id ON orders(user_id) WHERE user_id IS NOT NULL;

DROP INDEX IF EXISTS idx_notifications_user_id;
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE user_id IS NOT NULL;

DROP INDEX IF EXISTS idx_stripe_customers_user_id;
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);

DROP INDEX IF EXISTS idx_customer_addresses_user_id;
CREATE INDEX idx_customer_addresses_user_id ON customer_addresses(user_id);

-- Add comments
COMMENT ON TABLE orders IS 'Orders table updated for Clerk authentication - user_id is now TEXT';
COMMENT ON TABLE notifications IS 'Notifications table updated for Clerk authentication - user_id is now TEXT';
COMMENT ON TABLE notification_preferences IS 'Notification preferences updated for Clerk authentication - user_id is now TEXT';

-- Create a helper function to validate Clerk user IDs (optional)
CREATE OR REPLACE FUNCTION is_valid_clerk_user_id(user_id_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Clerk user IDs typically start with 'user_' followed by alphanumeric characters
  -- This is a basic validation - adjust as needed
  RETURN user_id_input IS NOT NULL
    AND LENGTH(user_id_input) > 5
    AND user_id_input ~ '^user_[a-zA-Z0-9]+$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION is_valid_clerk_user_id(TEXT) IS 'Validates Clerk user ID format';
