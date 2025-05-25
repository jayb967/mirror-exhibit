-- Create coupon-related functions and ensure coupons table exists
-- This handles coupon usage tracking and validation

-- First, ensure coupons table exists with required columns
DO $$
BEGIN
    -- Create coupons table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupons') THEN
        CREATE TABLE coupons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
            discount_value DECIMAL(10,2) NOT NULL,
            usage_limit INTEGER,
            usage_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Add indexes
        CREATE INDEX idx_coupons_code ON coupons(code);
        CREATE INDEX idx_coupons_active ON coupons(is_active);
        CREATE INDEX idx_coupons_expires_at ON coupons(expires_at);
        
        RAISE NOTICE 'Created coupons table';
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coupons' AND column_name = 'usage_count') THEN
        ALTER TABLE coupons ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coupons' AND column_name = 'usage_limit') THEN
        ALTER TABLE coupons ADD COLUMN usage_limit INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'coupons' AND column_name = 'is_active') THEN
        ALTER TABLE coupons ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
END $$;

-- Create the increment_coupon_usage function
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    current_usage INTEGER;
    usage_limit_val INTEGER;
BEGIN
    -- Get current usage and limit
    SELECT usage_count, usage_limit 
    INTO current_usage, usage_limit_val
    FROM coupons 
    WHERE id = coupon_id;
    
    -- Check if coupon exists
    IF NOT FOUND THEN
        result := json_build_object(
            'success', false,
            'error', 'Coupon not found'
        );
        RETURN result;
    END IF;
    
    -- Check if usage limit would be exceeded
    IF usage_limit_val IS NOT NULL AND current_usage >= usage_limit_val THEN
        result := json_build_object(
            'success', false,
            'error', 'Coupon usage limit exceeded'
        );
        RETURN result;
    END IF;
    
    -- Increment usage count
    UPDATE coupons 
    SET 
        usage_count = usage_count + 1,
        updated_at = now()
    WHERE id = coupon_id;
    
    -- Return success
    result := json_build_object(
        'success', true,
        'new_usage_count', current_usage + 1
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'success', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$;

-- Create function to validate coupon
CREATE OR REPLACE FUNCTION validate_coupon(coupon_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    coupon_record RECORD;
BEGIN
    -- Get coupon details
    SELECT 
        id,
        code,
        discount_type,
        discount_value,
        usage_limit,
        usage_count,
        is_active,
        expires_at
    INTO coupon_record
    FROM coupons 
    WHERE code = coupon_code;
    
    -- Check if coupon exists
    IF NOT FOUND THEN
        result := json_build_object(
            'valid', false,
            'error', 'Coupon not found'
        );
        RETURN result;
    END IF;
    
    -- Check if coupon is active
    IF NOT coupon_record.is_active THEN
        result := json_build_object(
            'valid', false,
            'error', 'Coupon is not active'
        );
        RETURN result;
    END IF;
    
    -- Check if coupon has expired
    IF coupon_record.expires_at IS NOT NULL AND coupon_record.expires_at < now() THEN
        result := json_build_object(
            'valid', false,
            'error', 'Coupon has expired'
        );
        RETURN result;
    END IF;
    
    -- Check usage limit
    IF coupon_record.usage_limit IS NOT NULL AND coupon_record.usage_count >= coupon_record.usage_limit THEN
        result := json_build_object(
            'valid', false,
            'error', 'Coupon usage limit reached'
        );
        RETURN result;
    END IF;
    
    -- Coupon is valid
    result := json_build_object(
        'valid', true,
        'coupon', json_build_object(
            'id', coupon_record.id,
            'code', coupon_record.code,
            'discount_type', coupon_record.discount_type,
            'discount_value', coupon_record.discount_value,
            'usage_count', coupon_record.usage_count,
            'usage_limit', coupon_record.usage_limit
        )
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        result := json_build_object(
            'valid', false,
            'error', SQLERRM
        );
        RETURN result;
END;
$$;

-- Add comments
COMMENT ON FUNCTION increment_coupon_usage(UUID) IS 'Increments the usage count for a coupon and validates usage limits';
COMMENT ON FUNCTION validate_coupon(TEXT) IS 'Validates a coupon code and returns coupon details if valid';

-- Grant permissions (adjust as needed for your RLS setup)
GRANT EXECUTE ON FUNCTION increment_coupon_usage(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION validate_coupon(TEXT) TO authenticated, anon;

-- Success message
SELECT 'Coupon functions created successfully' as result;
