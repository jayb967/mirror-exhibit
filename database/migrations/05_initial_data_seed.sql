-- =====================================================
-- INITIAL DATA SEED MIGRATION
-- Seeds the database with default email templates, shipping carriers, and system data
-- =====================================================

-- Insert default shipping carriers
INSERT INTO shipping_carriers (name, code, tracking_url_template, is_active, supports_real_time_tracking) VALUES
('United States Postal Service', 'USPS', 'https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking_number}', true, true),
('FedEx', 'FEDEX', 'https://www.fedex.com/fedextrack/?trknbr={tracking_number}', true, true),
('UPS', 'UPS', 'https://www.ups.com/track?loc=en_US&tracknum={tracking_number}', true, true),
('DHL', 'DHL', 'https://www.dhl.com/en/express/tracking.html?AWB={tracking_number}', true, true),
('Amazon Logistics', 'AMAZON', 'https://track.amazon.com/tracking/{tracking_number}', true, false),
('OnTrac', 'ONTRAC', 'https://www.ontrac.com/trackres.asp?tracking_number={tracking_number}', true, false),
('LaserShip', 'LASERSHIP', 'https://www.lasership.com/track/{tracking_number}', true, false);

-- Insert default email templates
INSERT INTO email_templates (template_key, name, description, subject, html_content, text_content, variables, is_system) VALUES

-- Order Confirmation Template
('order_confirmation', 'Order Confirmation', 'Sent when an order is successfully placed',
'Order Confirmation - #{order_number}',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #A6A182; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #A6A182; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Mirror Exhibit</h1>
            <h2>Order Confirmation</h2>
        </div>
        <div class="content">
            <p>Dear {{customer_name}},</p>
            <p>Thank you for your order! We have received your order and are preparing it for shipment.</p>

            <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> {{order_number}}</p>
                <p><strong>Order Date:</strong> {{order_date}}</p>
                <p><strong>Total Amount:</strong> ${{total_amount}}</p>
            </div>

            <p>You can track your order status at any time by visiting your account dashboard.</p>
            <p>We will send you another email when your order ships with tracking information.</p>
        </div>
        <div class="footer">
            <p>Thank you for choosing Mirror Exhibit</p>
            <p>If you have any questions, please contact us at orders@mirrorexhibit.com</p>
        </div>
    </div>
</body>
</html>',
'Dear {{customer_name}},

Thank you for your order! We have received your order and are preparing it for shipment.

Order Details:
Order Number: {{order_number}}
Order Date: {{order_date}}
Total Amount: ${{total_amount}}

You can track your order status at any time by visiting your account dashboard.
We will send you another email when your order ships with tracking information.

Thank you for choosing Mirror Exhibit
If you have any questions, please contact us at orders@mirrorexhibit.com',
'["customer_name", "order_number", "order_date", "total_amount", "order_items", "shipping_address"]',
true),

-- Order Shipped Template
('order_shipped', 'Order Shipped', 'Sent when an order is shipped with tracking information',
'Your Order Has Shipped - #{order_number}',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Shipped</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #A6A182; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .tracking-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #A6A182; text-align: center; }
        .track-button { display: inline-block; background: #A6A182; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Mirror Exhibit</h1>
            <h2>Your Order Has Shipped!</h2>
        </div>
        <div class="content">
            <p>Dear {{customer_name}},</p>
            <p>Great news! Your order has been shipped and is on its way to you.</p>

            <div class="tracking-info">
                <h3>Tracking Information</h3>
                <p><strong>Order Number:</strong> {{order_number}}</p>
                <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
                <p><strong>Carrier:</strong> {{carrier_name}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimated_delivery}}</p>
                <a href="{{tracking_url}}" class="track-button">Track Your Package</a>
            </div>

            <p>You can also track your order by visiting your account dashboard.</p>
        </div>
        <div class="footer">
            <p>Thank you for choosing Mirror Exhibit</p>
            <p>If you have any questions, please contact us at orders@mirrorexhibit.com</p>
        </div>
    </div>
</body>
</html>',
'Dear {{customer_name}},

Great news! Your order has been shipped and is on its way to you.

Tracking Information:
Order Number: {{order_number}}
Tracking Number: {{tracking_number}}
Carrier: {{carrier_name}}
Estimated Delivery: {{estimated_delivery}}

Track your package: {{tracking_url}}

You can also track your order by visiting your account dashboard.

Thank you for choosing Mirror Exhibit
If you have any questions, please contact us at orders@mirrorexhibit.com',
'["customer_name", "order_number", "tracking_number", "carrier_name", "estimated_delivery", "tracking_url"]',
true),

-- Order Delivered Template
('order_delivered', 'Order Delivered', 'Sent when an order is delivered',
'Your Order Has Been Delivered - #{order_number}',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Delivered</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #A6A182; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .delivery-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #A6A182; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Mirror Exhibit</h1>
            <h2>Your Order Has Been Delivered!</h2>
        </div>
        <div class="content">
            <p>Dear {{customer_name}},</p>
            <p>Your order has been successfully delivered!</p>

            <div class="delivery-info">
                <h3>Delivery Confirmation</h3>
                <p><strong>Order Number:</strong> {{order_number}}</p>
                <p><strong>Delivered On:</strong> {{delivery_date}}</p>
                <p><strong>Delivered To:</strong> {{delivery_address}}</p>
            </div>

            <p>We hope you love your new mirror! If you have any issues with your order, please don''t hesitate to contact us.</p>
            <p>We would love to hear about your experience. Consider leaving us a review!</p>
        </div>
        <div class="footer">
            <p>Thank you for choosing Mirror Exhibit</p>
            <p>If you have any questions, please contact us at orders@mirrorexhibit.com</p>
        </div>
    </div>
</body>
</html>',
'Dear {{customer_name}},

Your order has been successfully delivered!

Delivery Confirmation:
Order Number: {{order_number}}
Delivered On: {{delivery_date}}
Delivered To: {{delivery_address}}

We hope you love your new mirror! If you have any issues with your order, please don''t hesitate to contact us.
We would love to hear about your experience. Consider leaving us a review!

Thank you for choosing Mirror Exhibit
If you have any questions, please contact us at orders@mirrorexhibit.com',
'["customer_name", "order_number", "delivery_date", "delivery_address"]',
true),

-- Admin New Order Template
('admin_new_order', 'Admin New Order Alert', 'Sent to admins when a new order is placed',
'New Order Received - #{order_number}',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Order Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #A6A182; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-summary { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #A6A182; }
        .admin-button { display: inline-block; background: #A6A182; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Mirror Exhibit Admin</h1>
            <h2>New Order Alert</h2>
        </div>
        <div class="content">
            <p>A new order has been placed and requires processing.</p>

            <div class="order-summary">
                <h3>Order Summary</h3>
                <p><strong>Order Number:</strong> {{order_number}}</p>
                <p><strong>Customer:</strong> {{customer_name}} ({{customer_email}})</p>
                <p><strong>Order Date:</strong> {{order_date}}</p>
                <p><strong>Total Amount:</strong> ${{total_amount}}</p>
                <p><strong>Payment Status:</strong> {{payment_status}}</p>
                <a href="{{admin_order_url}}" class="admin-button">View Order in Admin</a>
            </div>

            <p>Please process this order as soon as possible.</p>
        </div>
        <div class="footer">
            <p>Mirror Exhibit Admin System</p>
        </div>
    </div>
</body>
</html>',
'New Order Alert

A new order has been placed and requires processing.

Order Summary:
Order Number: {{order_number}}
Customer: {{customer_name}} ({{customer_email}})
Order Date: {{order_date}}
Total Amount: ${{total_amount}}
Payment Status: {{payment_status}}

View order in admin: {{admin_order_url}}

Please process this order as soon as possible.

Mirror Exhibit Admin System',
'["order_number", "customer_name", "customer_email", "order_date", "total_amount", "payment_status", "admin_order_url"]',
true),

-- Order Status Update Template
('order_status_update', 'Order Status Update', 'Sent when order status changes',
'Order Status Update - #{order_number}',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #A6A182; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .status-update { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #A6A182; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Mirror Exhibit</h1>
            <h2>Order Status Update</h2>
        </div>
        <div class="content">
            <p>Dear {{customer_name}},</p>
            <p>We have an update on your order status.</p>

            <div class="status-update">
                <h3>Status Update</h3>
                <p><strong>Order Number:</strong> {{order_number}}</p>
                <p><strong>New Status:</strong> {{new_status}}</p>
                <p><strong>Update Date:</strong> {{update_date}}</p>
                {{#status_message}}
                <p><strong>Message:</strong> {{status_message}}</p>
                {{/status_message}}
            </div>

            <p>You can view your complete order details and tracking information in your account dashboard.</p>
        </div>
        <div class="footer">
            <p>Thank you for choosing Mirror Exhibit</p>
            <p>If you have any questions, please contact us at orders@mirrorexhibit.com</p>
        </div>
    </div>
</body>
</html>',
'Dear {{customer_name}},

We have an update on your order status.

Status Update:
Order Number: {{order_number}}
New Status: {{new_status}}
Update Date: {{update_date}}
{{#status_message}}
Message: {{status_message}}
{{/status_message}}

You can view your complete order details and tracking information in your account dashboard.

Thank you for choosing Mirror Exhibit
If you have any questions, please contact us at orders@mirrorexhibit.com',
'["customer_name", "order_number", "new_status", "update_date", "status_message"]',
true);

-- Create function to manually create notification preferences for new users
-- This function will be called from the application when a user signs up with Clerk
CREATE OR REPLACE FUNCTION create_user_notification_preferences(user_uuid TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    email_order_updates,
    email_shipping_updates,
    email_promotional,
    email_system_updates,
    in_app_order_updates,
    in_app_shipping_updates,
    in_app_promotional,
    in_app_system_updates
  ) VALUES (
    user_uuid,
    true,  -- email_order_updates
    true,  -- email_shipping_updates
    true,  -- email_promotional
    true,  -- email_system_updates
    true,  -- in_app_order_updates
    true,  -- in_app_shipping_updates
    true,  -- in_app_promotional
    false  -- in_app_system_updates
  )
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



-- Add some sample admin notifications (optional)
INSERT INTO notifications (admin_only, type, title, message, data) VALUES
(true, 'admin_system_alert', 'Order Management System Updated', 'The order management system has been updated with new tracking and notification features.', '{"version": "2.0", "features": ["enhanced_tracking", "email_notifications", "customer_dashboard"]}'),
(true, 'admin_system_alert', 'Database Migration Complete', 'All database migrations have been successfully applied. The system is ready for enhanced order processing.', '{"migration_version": "05", "tables_added": 15}');

-- Add comments
COMMENT ON FUNCTION create_user_notification_preferences(TEXT) IS 'Manually creates default notification preferences for new Clerk users';
