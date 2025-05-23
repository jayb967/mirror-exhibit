-- =====================================================
-- UNIFIED ORDER SCHEMA MIGRATION
-- This migration creates a consistent order schema with proper references
-- Run this after backing up your existing orders table
-- =====================================================

-- First, let's create a backup of existing orders
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;

-- Drop existing orders table constraints that might conflict
ALTER TABLE IF EXISTS order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

-- Create the unified orders table with all necessary fields
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User references (supports both authenticated and guest users)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_token TEXT,
  guest_email TEXT,

  -- Order status and workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'paid', 'processing', 'shipped',
    'out_for_delivery', 'delivered', 'canceled', 'refunded',
    'failed', 'returned', 'exchange_requested'
  )),

  -- Financial information
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  tax_description TEXT,
  shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Shipping information
  shipping_address JSONB NOT NULL,
  shipping_address_id UUID REFERENCES shipping_addresses(id) ON DELETE SET NULL,
  shipping_method TEXT,
  shipping_carrier TEXT,

  -- Payment information
  payment_method TEXT,
  payment_intent_id TEXT,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,

  -- Tracking information
  tracking_number TEXT,
  tracking_url TEXT,
  shipping_label_url TEXT,
  courier_id TEXT,
  courier_name TEXT,
  estimated_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,

  -- Order metadata
  notes TEXT,
  internal_notes TEXT, -- Admin-only notes
  order_source TEXT DEFAULT 'website', -- website, admin, api, etc.

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT orders_user_or_guest CHECK (
    (user_id IS NOT NULL) OR (guest_token IS NOT NULL AND guest_email IS NOT NULL)
  ),
  CONSTRAINT orders_positive_amounts CHECK (
    subtotal >= 0 AND tax_amount >= 0 AND shipping_cost >= 0 AND
    discount_amount >= 0 AND total_amount >= 0
  )
);

-- Create the unified order_items table with product variation support
DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Product references
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_variation_id UUID REFERENCES product_variations(id) ON DELETE SET NULL,

  -- Product details at time of purchase (for historical accuracy)
  product_name TEXT NOT NULL,
  product_description TEXT,
  size_name TEXT,
  frame_type TEXT,
  sku TEXT,

  -- Pricing and quantity
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),

  -- Stripe integration
  stripe_product_id TEXT,
  stripe_price_id TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Ensure total_price matches unit_price * quantity
  CONSTRAINT order_items_price_consistency CHECK (
    total_price = unit_price * quantity
  )
);

-- Create indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_orders_guest_token ON orders(guest_token) WHERE guest_token IS NOT NULL;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number) WHERE tracking_number IS NOT NULL;

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_order_items_product_variation_id ON order_items(product_variation_id) WHERE product_variation_id IS NOT NULL;
CREATE INDEX idx_order_items_stripe_product_id ON order_items(stripe_product_id) WHERE stripe_product_id IS NOT NULL;

-- Create updated_at trigger for orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();

  -- Auto-set timestamp fields based on status changes
  IF OLD.status != NEW.status THEN
    CASE NEW.status
      WHEN 'confirmed' THEN NEW.confirmed_at = now();
      WHEN 'shipped' THEN NEW.shipped_at = now();
      WHEN 'delivered' THEN
        NEW.delivered_at = now();
        NEW.actual_delivery_date = now();
      ELSE NULL;
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    (auth.uid() IS NULL AND guest_token IS NOT NULL)
  );

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    (auth.uid() IS NULL AND guest_token IS NOT NULL)
  );

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (auth.uid() IS NULL AND guest_token IS NOT NULL)
  );

-- Admin policies for orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
      AND (user_id = auth.uid() OR (auth.uid() IS NULL AND guest_token IS NOT NULL))
    )
  );

CREATE POLICY "Users can insert their order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_items.order_id
      AND (user_id = auth.uid() OR (auth.uid() IS NULL AND guest_token IS NOT NULL))
    )
  );

-- Admin policies for order_items
CREATE POLICY "Admins can manage all order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Unified orders table supporting both authenticated and guest users with comprehensive tracking';
COMMENT ON TABLE order_items IS 'Order items with product variation support and historical data preservation';

COMMENT ON COLUMN orders.status IS 'Order status: pending, confirmed, paid, processing, shipped, out_for_delivery, delivered, canceled, refunded, failed, returned, exchange_requested';
COMMENT ON COLUMN orders.guest_token IS 'Unique token for guest users to access their orders';
COMMENT ON COLUMN orders.internal_notes IS 'Admin-only notes not visible to customers';
COMMENT ON COLUMN orders.order_source IS 'Source of the order: website, admin, api, mobile, etc.';

COMMENT ON COLUMN order_items.unit_price IS 'Price per unit at time of purchase';
COMMENT ON COLUMN order_items.total_price IS 'Total price for this line item (unit_price * quantity)';
COMMENT ON COLUMN order_items.stripe_product_id IS 'Stripe product ID for analytics and refunds';
COMMENT ON COLUMN order_items.stripe_price_id IS 'Stripe price ID for analytics and refunds';
