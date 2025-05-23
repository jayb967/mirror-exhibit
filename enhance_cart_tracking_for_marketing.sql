-- Enhance cart_tracking table for better marketing tracking
-- This adds fields to track different stages of the payment process

-- Add new columns for detailed payment tracking
DO $$
BEGIN
  -- Add payment_intent_started column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'payment_intent_started'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN payment_intent_started BOOLEAN DEFAULT false;
  END IF;

  -- Add payment_intent_started_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'payment_intent_started_at'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN payment_intent_started_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add stripe_session_id for tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN stripe_session_id TEXT;
  END IF;

  -- Add payment_abandoned flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'payment_abandoned'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN payment_abandoned BOOLEAN DEFAULT false;
  END IF;

  -- Add payment_abandoned_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'payment_abandoned_at'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN payment_abandoned_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add marketing_emails_sent counter
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'marketing_emails_sent'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN marketing_emails_sent INTEGER DEFAULT 0;
  END IF;

  -- Add last_marketing_email_sent timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'last_marketing_email_sent'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN last_marketing_email_sent TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add checkout_form_completed flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'checkout_form_completed'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN checkout_form_completed BOOLEAN DEFAULT false;
  END IF;

  -- Add checkout_form_completed_at timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'checkout_form_completed_at'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN checkout_form_completed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add customer_data for marketing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'customer_data'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN customer_data JSONB;
  END IF;

  -- Add shipping_data for marketing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_tracking' 
    AND column_name = 'shipping_data'
  ) THEN
    ALTER TABLE cart_tracking ADD COLUMN shipping_data JSONB;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cart_tracking_payment_intent_started ON cart_tracking(payment_intent_started);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_payment_abandoned ON cart_tracking(payment_abandoned);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_checkout_form_completed ON cart_tracking(checkout_form_completed);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_stripe_session_id ON cart_tracking(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_cart_tracking_marketing_emails ON cart_tracking(marketing_emails_sent, last_marketing_email_sent);

-- Create composite indexes for marketing queries
CREATE INDEX IF NOT EXISTS idx_cart_tracking_marketing_funnel ON cart_tracking(
  checkout_started, 
  checkout_form_completed, 
  payment_intent_started, 
  checkout_completed, 
  payment_abandoned
);

-- Add comments for documentation
COMMENT ON COLUMN cart_tracking.payment_intent_started IS 'True when user reaches Stripe payment page';
COMMENT ON COLUMN cart_tracking.payment_intent_started_at IS 'Timestamp when user first reached Stripe payment page';
COMMENT ON COLUMN cart_tracking.stripe_session_id IS 'Stripe checkout session ID for tracking';
COMMENT ON COLUMN cart_tracking.payment_abandoned IS 'True if user abandoned payment process';
COMMENT ON COLUMN cart_tracking.payment_abandoned_at IS 'Timestamp when payment was abandoned';
COMMENT ON COLUMN cart_tracking.marketing_emails_sent IS 'Number of marketing emails sent to this user';
COMMENT ON COLUMN cart_tracking.last_marketing_email_sent IS 'Timestamp of last marketing email sent';
COMMENT ON COLUMN cart_tracking.checkout_form_completed IS 'True when user completes checkout form';
COMMENT ON COLUMN cart_tracking.checkout_form_completed_at IS 'Timestamp when checkout form was completed';
COMMENT ON COLUMN cart_tracking.customer_data IS 'Customer information for marketing (name, phone, etc.)';
COMMENT ON COLUMN cart_tracking.shipping_data IS 'Shipping information for marketing analysis';

-- Create a view for marketing analysis
CREATE OR REPLACE VIEW cart_tracking_marketing_funnel AS
SELECT 
  id,
  user_id,
  guest_token,
  email,
  created_at,
  last_activity,
  
  -- Cart stage
  CASE WHEN cart_items IS NOT NULL AND jsonb_array_length(cart_items) > 0 THEN true ELSE false END as has_cart_items,
  subtotal,
  
  -- Checkout stages
  checkout_started,
  checkout_form_completed,
  checkout_form_completed_at,
  
  -- Payment stages
  payment_intent_started,
  payment_intent_started_at,
  checkout_completed,
  payment_abandoned,
  payment_abandoned_at,
  
  -- Marketing tracking
  recovery_email_sent,
  marketing_emails_sent,
  last_marketing_email_sent,
  
  -- Customer data
  customer_data,
  shipping_data,
  
  -- UTM tracking
  utm_source,
  utm_medium,
  utm_campaign,
  
  -- Device info
  device_type,
  browser,
  
  -- Calculate stage reached
  CASE 
    WHEN checkout_completed THEN 'completed'
    WHEN payment_abandoned THEN 'payment_abandoned'
    WHEN payment_intent_started THEN 'payment_started'
    WHEN checkout_form_completed THEN 'form_completed'
    WHEN checkout_started THEN 'checkout_started'
    WHEN cart_items IS NOT NULL AND jsonb_array_length(cart_items) > 0 THEN 'has_items'
    ELSE 'empty'
  END as funnel_stage,
  
  -- Calculate time in each stage
  CASE 
    WHEN checkout_completed THEN EXTRACT(EPOCH FROM (updated_at - created_at))/3600
    WHEN payment_abandoned_at IS NOT NULL THEN EXTRACT(EPOCH FROM (payment_abandoned_at - created_at))/3600
    ELSE EXTRACT(EPOCH FROM (last_activity - created_at))/3600
  END as hours_in_funnel

FROM cart_tracking
WHERE created_at >= NOW() - INTERVAL '90 days'; -- Last 90 days for performance

-- Grant permissions
GRANT SELECT ON cart_tracking_marketing_funnel TO authenticated, anon;

-- Add trigger to automatically set payment_abandoned after 24 hours of inactivity
CREATE OR REPLACE FUNCTION mark_abandoned_payments()
RETURNS void AS $$
BEGIN
  UPDATE cart_tracking 
  SET 
    payment_abandoned = true,
    payment_abandoned_at = NOW(),
    updated_at = NOW()
  WHERE 
    payment_intent_started = true 
    AND checkout_completed = false 
    AND payment_abandoned = false
    AND payment_intent_started_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a function to get marketing targets
CREATE OR REPLACE FUNCTION get_marketing_targets(
  target_stage TEXT DEFAULT 'payment_started',
  hours_since_last_activity INTEGER DEFAULT 2,
  max_emails_sent INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  customer_data JSONB,
  cart_items JSONB,
  subtotal DECIMAL,
  funnel_stage TEXT,
  hours_since_activity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ct.id,
    ct.email,
    ct.customer_data,
    ct.cart_items,
    ct.subtotal,
    cmf.funnel_stage,
    cmf.hours_in_funnel
  FROM cart_tracking ct
  JOIN cart_tracking_marketing_funnel cmf ON ct.id = cmf.id
  WHERE 
    cmf.funnel_stage = target_stage
    AND ct.email IS NOT NULL
    AND ct.last_activity < NOW() - (hours_since_last_activity || ' hours')::INTERVAL
    AND (ct.marketing_emails_sent < max_emails_sent OR ct.marketing_emails_sent IS NULL)
    AND ct.checkout_completed = false
    AND (ct.payment_abandoned = false OR ct.payment_abandoned IS NULL)
  ORDER BY ct.last_activity DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_marketing_targets(TEXT, INTEGER, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION mark_abandoned_payments() TO authenticated, anon;
