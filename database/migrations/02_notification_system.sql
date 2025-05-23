-- =====================================================
-- NOTIFICATION SYSTEM MIGRATION
-- Creates tables for in-app notifications, email templates, and user preferences
-- =====================================================

-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'order_confirmation',
  'order_status_update',
  'payment_confirmation',
  'shipping_notification',
  'delivery_confirmation',
  'admin_new_order',
  'admin_low_stock',
  'admin_system_alert',
  'user_welcome',
  'cart_abandonment',
  'promotional',
  'system_maintenance'
);

-- Create notification channels enum
CREATE TYPE notification_channel AS ENUM (
  'in_app',
  'email',
  'sms',
  'push'
);

-- Create notifications table for in-app notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Recipient information
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_only BOOLEAN DEFAULT false,

  -- Notification content
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- URL to navigate when notification is clicked

  -- Metadata
  data JSONB, -- Additional data (order_id, product_id, etc.)

  -- Status
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration

  -- Constraints
  CONSTRAINT notifications_user_or_admin CHECK (
    (user_id IS NOT NULL AND admin_only = false) OR
    (user_id IS NULL AND admin_only = true)
  )
);

-- Create email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template identification
  template_key TEXT UNIQUE NOT NULL, -- e.g., 'order_confirmation', 'shipping_notification'
  name TEXT NOT NULL,
  description TEXT,

  -- Template content
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT, -- Plain text fallback

  -- Template variables documentation
  variables JSONB, -- JSON array of available variables like ['order_id', 'customer_name']

  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- System templates cannot be deleted

  -- SendGrid integration
  sendgrid_template_id TEXT, -- SendGrid dynamic template ID

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Email preferences
  email_order_updates BOOLEAN DEFAULT true,
  email_shipping_updates BOOLEAN DEFAULT true,
  email_promotional BOOLEAN DEFAULT true,
  email_system_updates BOOLEAN DEFAULT true,

  -- In-app preferences
  in_app_order_updates BOOLEAN DEFAULT true,
  in_app_shipping_updates BOOLEAN DEFAULT true,
  in_app_promotional BOOLEAN DEFAULT true,
  in_app_system_updates BOOLEAN DEFAULT false,

  -- SMS preferences (for future use)
  sms_order_updates BOOLEAN DEFAULT false,
  sms_shipping_updates BOOLEAN DEFAULT false,

  -- Push notification preferences (for future use)
  push_order_updates BOOLEAN DEFAULT true,
  push_shipping_updates BOOLEAN DEFAULT true,

  -- Global settings
  unsubscribed_all BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email queue table for reliable email delivery
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Recipient information
  to_email TEXT NOT NULL,
  to_name TEXT,
  from_email TEXT,
  from_name TEXT,

  -- Email content
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  template_data JSONB, -- Variables for template rendering

  -- Delivery settings
  priority INTEGER DEFAULT 5, -- 1 = highest, 10 = lowest
  max_attempts INTEGER DEFAULT 3,
  attempt_count INTEGER DEFAULT 0,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'sent', 'failed', 'cancelled'
  )),

  -- External service tracking
  sendgrid_message_id TEXT,
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB -- Additional tracking data
);

-- Create order status history table for audit trail
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Status change information
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for system changes
  change_reason TEXT,

  -- Additional data
  metadata JSONB, -- Tracking numbers, shipping info, etc.

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_admin_only ON notifications(admin_only) WHERE admin_only = true;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_email_templates_template_key ON email_templates(template_key);
CREATE INDEX idx_email_templates_is_active ON email_templates(is_active) WHERE is_active = true;

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled_at ON email_queue(scheduled_at);
CREATE INDEX idx_email_queue_priority ON email_queue(priority);
CREATE INDEX idx_email_queue_to_email ON email_queue(to_email);

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR
    (admin_only = true AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    ))
  );

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Admin policies for notifications
CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Public can view active email templates" ON email_templates
  FOR SELECT USING (is_active = true);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can manage their own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for email_queue (admin only)
CREATE POLICY "Admins can manage email queue" ON email_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for order_status_history
CREATE POLICY "Users can view their order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_status_history.order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order status history" ON order_status_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'In-app notifications for users and admins';
COMMENT ON TABLE email_templates IS 'Email templates for automated notifications';
COMMENT ON TABLE notification_preferences IS 'User preferences for different types of notifications';
COMMENT ON TABLE email_queue IS 'Queue for reliable email delivery with retry logic';
COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';

COMMENT ON COLUMN notifications.admin_only IS 'True for admin-only notifications (system alerts, new orders, etc.)';
COMMENT ON COLUMN notifications.data IS 'Additional data in JSON format (order_id, product_id, etc.)';
COMMENT ON COLUMN email_templates.variables IS 'JSON array of available template variables';
COMMENT ON COLUMN email_queue.priority IS 'Email priority: 1 = highest, 10 = lowest';
COMMENT ON COLUMN order_status_history.changed_by IS 'User who made the change, NULL for system changes';
