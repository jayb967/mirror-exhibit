-- =====================================================
-- ORDER TRACKING ENHANCEMENTS MIGRATION
-- Enhances order tracking with Easyship integration and comprehensive status management
-- =====================================================

-- Create shipping_carriers table for standardized carrier information
CREATE TABLE shipping_carriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Carrier information
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL, -- USPS, FEDEX, UPS, DHL, etc.

  -- Tracking configuration
  tracking_url_template TEXT, -- Template with {tracking_number} placeholder

  -- Easyship integration
  easyship_courier_id TEXT,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  supports_real_time_tracking BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create shipping_tracking_events table for detailed tracking history
CREATE TABLE shipping_tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Order reference
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Event information
  event_type TEXT NOT NULL, -- shipped, in_transit, out_for_delivery, delivered, exception, etc.
  event_description TEXT NOT NULL,
  event_location TEXT,

  -- Timing
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Source information
  source TEXT DEFAULT 'easyship', -- easyship, manual, carrier_api, etc.
  external_event_id TEXT, -- ID from external system

  -- Additional data
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_fulfillment table for admin fulfillment workflow
CREATE TABLE order_fulfillment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Order reference
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Fulfillment status
  fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN (
    'pending', 'processing', 'ready_to_ship', 'shipped', 'completed', 'cancelled'
  )),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,

  -- Packaging information
  package_weight DECIMAL(8, 2),
  package_weight_unit TEXT DEFAULT 'lb',
  package_length DECIMAL(8, 2),
  package_width DECIMAL(8, 2),
  package_height DECIMAL(8, 2),
  package_dimension_unit TEXT DEFAULT 'in',

  -- Shipping information
  shipping_carrier_id UUID REFERENCES shipping_carriers(id) ON DELETE SET NULL,
  shipping_service TEXT, -- standard, express, overnight, etc.

  -- Easyship integration
  easyship_shipment_id TEXT,
  easyship_rate_id TEXT,

  -- Fulfillment notes
  packing_notes TEXT,
  shipping_notes TEXT,
  internal_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create customer_addresses table for saved addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Address information
  label TEXT, -- Home, Work, etc.
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,

  -- Settings
  is_default BOOLEAN DEFAULT false,
  is_billing_address BOOLEAN DEFAULT false,

  -- Validation
  is_validated BOOLEAN DEFAULT false,
  validation_data JSONB, -- Address validation results

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_returns table for return management
CREATE TABLE order_returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Order reference
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Return information
  return_reason TEXT NOT NULL,
  return_description TEXT,
  return_status TEXT DEFAULT 'requested' CHECK (return_status IN (
    'requested', 'approved', 'rejected', 'in_transit', 'received', 'processed', 'refunded'
  )),

  -- Items being returned
  return_items JSONB NOT NULL, -- Array of {order_item_id, quantity, reason}

  -- Financial information
  refund_amount DECIMAL(10, 2),
  refund_shipping BOOLEAN DEFAULT false,

  -- Tracking
  return_tracking_number TEXT,
  return_carrier TEXT,

  -- Processing
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_notes table for communication history
CREATE TABLE order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Order reference
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Note information
  note_type TEXT DEFAULT 'internal' CHECK (note_type IN (
    'internal', 'customer_service', 'fulfillment', 'shipping', 'return'
  )),
  note_content TEXT NOT NULL,

  -- Visibility
  is_customer_visible BOOLEAN DEFAULT false,

  -- Author
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_shipping_carriers_code ON shipping_carriers(code);
CREATE INDEX idx_shipping_carriers_is_active ON shipping_carriers(is_active) WHERE is_active = true;

CREATE INDEX idx_shipping_tracking_events_order_id ON shipping_tracking_events(order_id);
CREATE INDEX idx_shipping_tracking_events_event_timestamp ON shipping_tracking_events(event_timestamp);
CREATE INDEX idx_shipping_tracking_events_event_type ON shipping_tracking_events(event_type);

CREATE INDEX idx_order_fulfillment_order_id ON order_fulfillment(order_id);
CREATE INDEX idx_order_fulfillment_status ON order_fulfillment(fulfillment_status);
CREATE INDEX idx_order_fulfillment_assigned_to ON order_fulfillment(assigned_to) WHERE assigned_to IS NOT NULL;

CREATE INDEX idx_customer_addresses_user_id ON customer_addresses(user_id);
CREATE INDEX idx_customer_addresses_is_default ON customer_addresses(is_default) WHERE is_default = true;

CREATE INDEX idx_order_returns_order_id ON order_returns(order_id);
CREATE INDEX idx_order_returns_status ON order_returns(return_status);
CREATE INDEX idx_order_returns_created_at ON order_returns(created_at);

CREATE INDEX idx_order_notes_order_id ON order_notes(order_id);
CREATE INDEX idx_order_notes_note_type ON order_notes(note_type);
CREATE INDEX idx_order_notes_is_customer_visible ON order_notes(is_customer_visible) WHERE is_customer_visible = true;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_shipping_carriers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_shipping_carriers_updated_at
  BEFORE UPDATE ON shipping_carriers
  FOR EACH ROW
  EXECUTE FUNCTION update_shipping_carriers_updated_at();

CREATE OR REPLACE FUNCTION update_order_fulfillment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();

  -- Auto-set timestamps based on status changes
  IF OLD.fulfillment_status != NEW.fulfillment_status THEN
    CASE NEW.fulfillment_status
      WHEN 'processing' THEN NEW.started_at = now();
      WHEN 'completed' THEN NEW.completed_at = now();
      ELSE NULL;
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_fulfillment_updated_at
  BEFORE UPDATE ON order_fulfillment
  FOR EACH ROW
  EXECUTE FUNCTION update_order_fulfillment_updated_at();

CREATE OR REPLACE FUNCTION update_customer_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customer_addresses_updated_at
  BEFORE UPDATE ON customer_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_addresses_updated_at();

CREATE OR REPLACE FUNCTION update_order_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_returns_updated_at
  BEFORE UPDATE ON order_returns
  FOR EACH ROW
  EXECUTE FUNCTION update_order_returns_updated_at();

-- Enable Row Level Security
ALTER TABLE shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipping_carriers (public read, admin write)
CREATE POLICY "Public can view active shipping carriers" ON shipping_carriers
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage shipping carriers" ON shipping_carriers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for shipping_tracking_events
CREATE POLICY "Users can view their order tracking events" ON shipping_tracking_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = shipping_tracking_events.order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tracking events" ON shipping_tracking_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for order_fulfillment (admin only)
CREATE POLICY "Admins can manage order fulfillment" ON order_fulfillment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for customer_addresses
CREATE POLICY "Users can manage their own addresses" ON customer_addresses
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for order_returns
CREATE POLICY "Users can view their own returns" ON order_returns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_returns.order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create returns for their orders" ON order_returns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_returns.order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all returns" ON order_returns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for order_notes
CREATE POLICY "Users can view customer-visible notes for their orders" ON order_notes
  FOR SELECT USING (
    is_customer_visible = true AND EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_notes.order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order notes" ON order_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE shipping_carriers IS 'Standardized shipping carrier information with tracking templates';
COMMENT ON TABLE shipping_tracking_events IS 'Detailed tracking events for orders from various sources';
COMMENT ON TABLE order_fulfillment IS 'Admin workflow for order fulfillment and shipping';
COMMENT ON TABLE customer_addresses IS 'Saved customer addresses for faster checkout';
COMMENT ON TABLE order_returns IS 'Return requests and processing workflow';
COMMENT ON TABLE order_notes IS 'Communication history and notes for orders';

COMMENT ON COLUMN shipping_carriers.tracking_url_template IS 'URL template with {tracking_number} placeholder for tracking links';
COMMENT ON COLUMN shipping_tracking_events.source IS 'Source of the tracking event: easyship, manual, carrier_api, etc.';
COMMENT ON COLUMN order_fulfillment.fulfillment_status IS 'Fulfillment workflow status: pending, processing, ready_to_ship, shipped, completed, cancelled';
COMMENT ON COLUMN customer_addresses.is_validated IS 'Whether the address has been validated through an address validation service';
COMMENT ON COLUMN order_returns.return_items IS 'JSON array of items being returned with quantities and reasons';
COMMENT ON COLUMN order_notes.is_customer_visible IS 'Whether the note is visible to the customer or internal only';
