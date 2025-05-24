-- Setup Analytics Table with Proper RLS Policies
-- Run this in Supabase SQL Editor to fix analytics tracking issues

-- First, check if the product_analytics table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'product_analytics') THEN
        -- Create the product_analytics table if it doesn't exist
        CREATE TABLE product_analytics (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            product_id UUID REFERENCES products(id) ON DELETE SET NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            session_id TEXT,
            event_type TEXT NOT NULL CHECK (event_type IN (
                'view', 
                'add_to_cart_click', 
                'option_select', 
                'modal_open', 
                'modal_close',
                'carousel_interaction',
                'product_click'
            )),
            event_data JSONB DEFAULT '{}',
            ip_address TEXT,
            user_agent TEXT,
            referrer TEXT,
            source TEXT DEFAULT 'unknown',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX idx_product_analytics_product_id ON product_analytics(product_id);
        CREATE INDEX idx_product_analytics_user_id ON product_analytics(user_id);
        CREATE INDEX idx_product_analytics_session_id ON product_analytics(session_id);
        CREATE INDEX idx_product_analytics_event_type ON product_analytics(event_type);
        CREATE INDEX idx_product_analytics_created_at ON product_analytics(created_at);
        CREATE INDEX idx_product_analytics_source ON product_analytics(source);

        RAISE NOTICE 'Created product_analytics table with indexes';
    ELSE
        RAISE NOTICE 'product_analytics table already exists';
    END IF;
END $$;

-- Enable RLS on the table
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role full access" ON product_analytics;
DROP POLICY IF EXISTS "Allow anonymous insert" ON product_analytics;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own analytics" ON product_analytics;
DROP POLICY IF EXISTS "Allow users to view their own analytics" ON product_analytics;

-- Policy 1: Allow service role full access (for API endpoints)
CREATE POLICY "Allow service role full access" ON product_analytics
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- Policy 2: Allow anonymous users to insert analytics (for tracking)
CREATE POLICY "Allow anonymous insert" ON product_analytics
    FOR INSERT 
    TO anon 
    WITH CHECK (true);

-- Policy 3: Allow authenticated users to insert their own analytics
CREATE POLICY "Allow authenticated users to insert their own analytics" ON product_analytics
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy 4: Allow users to view their own analytics (optional - for user dashboards)
CREATE POLICY "Allow users to view their own analytics" ON product_analytics
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON product_analytics TO service_role;
GRANT INSERT ON product_analytics TO anon, authenticated;
GRANT SELECT ON product_analytics TO authenticated;

-- Verify the setup
SELECT 
    'Analytics table setup complete' as status,
    COUNT(*) as existing_records
FROM product_analytics;

-- Show the policies that were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'product_analytics'
ORDER BY policyname;

-- Test insert permissions (this should work now)
-- Uncomment the following lines to test:
/*
INSERT INTO product_analytics (
    event_type,
    event_data,
    source,
    session_id
) VALUES (
    'view',
    '{"test": true}',
    'setup_test',
    'test_session_' || extract(epoch from now())
);

SELECT 'Test insert successful' as test_result;
*/
