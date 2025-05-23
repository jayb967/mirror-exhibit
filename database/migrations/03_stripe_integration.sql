-- =====================================================
-- STRIPE INTEGRATION MIGRATION
-- Creates tables for Stripe product synchronization and analytics
-- =====================================================

-- Create stripe_products table for syncing products with Stripe
CREATE TABLE stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Local product reference
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_variation_id UUID REFERENCES product_variations(id) ON DELETE CASCADE,

  -- Stripe identifiers
  stripe_product_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT UNIQUE NOT NULL,

  -- Product details at time of sync
  name TEXT NOT NULL,
  description TEXT,

  -- Pricing information
  price_cents INTEGER NOT NULL, -- Price in cents
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Stripe metadata
  stripe_metadata JSONB, -- Additional Stripe metadata

  -- Sync status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN (
    'synced', 'pending', 'failed', 'archived'
  )),
  sync_error TEXT, -- Error message if sync failed

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Ensure unique combination of product and variation
  UNIQUE(product_id, product_variation_id)
);

-- Create stripe_price_history table for tracking price changes
CREATE TABLE stripe_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- References
  stripe_product_id UUID NOT NULL REFERENCES stripe_products(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

  -- Price information
  old_price_cents INTEGER,
  new_price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Change metadata
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_reason TEXT,

  -- Stripe sync information
  old_stripe_price_id TEXT,
  new_stripe_price_id TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stripe_webhooks table for tracking webhook events
CREATE TABLE stripe_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Stripe event information
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,

  -- Event data
  event_data JSONB NOT NULL,

  -- Processing status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_error TEXT,

  -- Related entities
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  stripe_product_id UUID REFERENCES stripe_products(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stripe_customers table for customer sync
CREATE TABLE stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Local user reference
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe customer information
  stripe_customer_id TEXT UNIQUE NOT NULL,

  -- Customer details
  email TEXT NOT NULL,
  name TEXT,

  -- Sync information
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN (
    'synced', 'pending', 'failed'
  )),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stripe_payment_intents table for detailed payment tracking
CREATE TABLE stripe_payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Order reference
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Stripe payment intent information
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,

  -- Payment details
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,

  -- Payment method information
  payment_method_id TEXT,
  payment_method_type TEXT, -- card, apple_pay, google_pay, etc.

  -- Additional data
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics table for Stripe-related analytics
CREATE TABLE stripe_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Time period
  date DATE NOT NULL,

  -- Metrics
  total_sales_cents INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  successful_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  refunded_amount_cents INTEGER DEFAULT 0,

  -- Product performance
  top_selling_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  top_selling_product_sales INTEGER DEFAULT 0,

  -- Payment method breakdown
  card_payments INTEGER DEFAULT 0,
  apple_pay_payments INTEGER DEFAULT 0,
  google_pay_payments INTEGER DEFAULT 0,
  other_payments INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Ensure one record per date
  UNIQUE(date)
);

-- Create indexes for better performance
CREATE INDEX idx_stripe_products_product_id ON stripe_products(product_id);
CREATE INDEX idx_stripe_products_product_variation_id ON stripe_products(product_variation_id) WHERE product_variation_id IS NOT NULL;
CREATE INDEX idx_stripe_products_stripe_product_id ON stripe_products(stripe_product_id);
CREATE INDEX idx_stripe_products_stripe_price_id ON stripe_products(stripe_price_id);
CREATE INDEX idx_stripe_products_is_active ON stripe_products(is_active) WHERE is_active = true;
CREATE INDEX idx_stripe_products_sync_status ON stripe_products(sync_status);

CREATE INDEX idx_stripe_price_history_stripe_product_id ON stripe_price_history(stripe_product_id);
CREATE INDEX idx_stripe_price_history_product_id ON stripe_price_history(product_id);
CREATE INDEX idx_stripe_price_history_created_at ON stripe_price_history(created_at);

CREATE INDEX idx_stripe_webhooks_stripe_event_id ON stripe_webhooks(stripe_event_id);
CREATE INDEX idx_stripe_webhooks_event_type ON stripe_webhooks(event_type);
CREATE INDEX idx_stripe_webhooks_processed ON stripe_webhooks(processed) WHERE processed = false;
CREATE INDEX idx_stripe_webhooks_order_id ON stripe_webhooks(order_id) WHERE order_id IS NOT NULL;

CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_customer_id ON stripe_customers(stripe_customer_id);
CREATE INDEX idx_stripe_customers_email ON stripe_customers(email);

CREATE INDEX idx_stripe_payment_intents_order_id ON stripe_payment_intents(order_id);
CREATE INDEX idx_stripe_payment_intents_stripe_payment_intent_id ON stripe_payment_intents(stripe_payment_intent_id);
CREATE INDEX idx_stripe_payment_intents_status ON stripe_payment_intents(status);

CREATE INDEX idx_stripe_analytics_date ON stripe_analytics(date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_stripe_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stripe_products_updated_at
  BEFORE UPDATE ON stripe_products
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_products_updated_at();

CREATE OR REPLACE FUNCTION update_stripe_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_customers_updated_at();

CREATE OR REPLACE FUNCTION update_stripe_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stripe_payment_intents_updated_at
  BEFORE UPDATE ON stripe_payment_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_payment_intents_updated_at();

CREATE OR REPLACE FUNCTION update_stripe_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stripe_analytics_updated_at
  BEFORE UPDATE ON stripe_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_analytics_updated_at();

-- Enable Row Level Security
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stripe_products (admin only)
CREATE POLICY "Admins can manage stripe products" ON stripe_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for stripe_price_history (admin only)
CREATE POLICY "Admins can view stripe price history" ON stripe_price_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for stripe_webhooks (admin only)
CREATE POLICY "Admins can manage stripe webhooks" ON stripe_webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for stripe_customers
CREATE POLICY "Users can view their own stripe customer data" ON stripe_customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all stripe customers" ON stripe_customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for stripe_payment_intents
CREATE POLICY "Users can view their own payment intents" ON stripe_payment_intents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = stripe_payment_intents.order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all payment intents" ON stripe_payment_intents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for stripe_analytics (admin only)
CREATE POLICY "Admins can view stripe analytics" ON stripe_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE stripe_products IS 'Synchronization table for products with Stripe';
COMMENT ON TABLE stripe_price_history IS 'Historical record of price changes for Stripe products';
COMMENT ON TABLE stripe_webhooks IS 'Log of Stripe webhook events for debugging and processing';
COMMENT ON TABLE stripe_customers IS 'Synchronization table for customers with Stripe';
COMMENT ON TABLE stripe_payment_intents IS 'Detailed tracking of Stripe payment intents';
COMMENT ON TABLE stripe_analytics IS 'Daily analytics aggregated from Stripe data';

COMMENT ON COLUMN stripe_products.price_cents IS 'Price in cents to avoid floating point precision issues';
COMMENT ON COLUMN stripe_products.sync_status IS 'Status of synchronization with Stripe: synced, pending, failed, archived';
COMMENT ON COLUMN stripe_price_history.change_reason IS 'Reason for price change (admin update, bulk update, etc.)';
COMMENT ON COLUMN stripe_webhooks.processed IS 'Whether the webhook event has been processed';
COMMENT ON COLUMN stripe_payment_intents.payment_method_type IS 'Type of payment method used (card, apple_pay, google_pay, etc.)';
