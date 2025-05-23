# Database Migrations for Enhanced Order Management System

This directory contains SQL migration files to enhance the Mirror Exhibit e-commerce platform with comprehensive order management, notifications, Stripe integration, and tracking capabilities.

## Migration Files Overview

### 01_unified_order_schema.sql
**Purpose:** Creates a unified, comprehensive order schema with proper references and constraints.

**Key Features:**
- Unified orders table supporting both authenticated and guest users
- Enhanced order_items table with product variation support
- Comprehensive order status workflow
- Financial tracking (subtotal, tax, shipping, discounts)
- Payment integration fields (Stripe)
- Tracking information fields
- Automatic timestamp management
- Row Level Security (RLS) policies

**Important:** This migration will backup your existing orders table and recreate it. Make sure to backup your database before running.

### 02_notification_system.sql
**Purpose:** Creates a complete notification system for in-app notifications, email templates, and user preferences.

**Key Features:**
- In-app notifications table with user and admin support
- Email templates with variable substitution
- User notification preferences
- Email queue for reliable delivery
- Order status history for audit trail
- Comprehensive RLS policies

### 03_stripe_integration.sql
**Purpose:** Adds Stripe product synchronization and analytics capabilities.

**Key Features:**
- Stripe products synchronization table
- Price history tracking
- Webhook event logging
- Customer synchronization
- Payment intent tracking
- Daily analytics aggregation
- Admin-only access controls

### 04_order_tracking_enhancements.sql
**Purpose:** Enhances order tracking with Easyship integration and fulfillment workflow.

**Key Features:**
- Shipping carriers management
- Detailed tracking events
- Order fulfillment workflow
- Customer address management
- Return/refund system
- Order notes and communication
- Comprehensive tracking capabilities

### 05_initial_data_seed.sql
**Purpose:** Seeds the database with default data including email templates and shipping carriers.

**Key Features:**
- Default shipping carriers (USPS, FedEx, UPS, DHL, etc.)
- Email templates for order lifecycle
- Default notification preferences
- Sample admin notifications
- Automatic preference creation for new users

## Migration Order

**IMPORTANT:** Run these migrations in the exact order listed below:

1. `01_unified_order_schema.sql`
2. `02_notification_system.sql`
3. `03_stripe_integration.sql`
4. `04_order_tracking_enhancements.sql`
5. `05_initial_data_seed.sql`

## Pre-Migration Checklist

### 1. Backup Your Database
```sql
-- Create a full backup of your database before running migrations
-- This is CRITICAL as migration 01 will recreate the orders table
```

### 2. Check Dependencies
Ensure these tables exist in your database:
- `auth.users` (Supabase auth)
- `products`
- `product_variations`
- `product_categories`
- `shipping_addresses`

### 3. Verify Permissions
Make sure you have the necessary permissions to:
- Create/drop tables
- Create functions and triggers
- Modify RLS policies
- Insert seed data

## Running the Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste each migration file content
4. Run them one by one in order
5. Check for any errors before proceeding to the next

### Option 2: Command Line (Advanced)
```bash
# If you have psql access to your Supabase database
psql "postgresql://[user]:[password]@[host]:[port]/[database]" -f 01_unified_order_schema.sql
psql "postgresql://[user]:[password]@[host]:[port]/[database]" -f 02_notification_system.sql
psql "postgresql://[user]:[password]@[host]:[port]/[database]" -f 03_stripe_integration.sql
psql "postgresql://[user]:[password]@[host]:[port]/[database]" -f 04_order_tracking_enhancements.sql
psql "postgresql://[user]:[password]@[host]:[port]/[database]" -f 05_initial_data_seed.sql
```

## Post-Migration Verification

After running all migrations, verify the setup:

### 1. Check Tables Created
```sql
-- Verify all new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'orders', 'order_items', 'notifications', 'email_templates', 
  'notification_preferences', 'email_queue', 'order_status_history',
  'stripe_products', 'stripe_price_history', 'stripe_webhooks',
  'stripe_customers', 'stripe_payment_intents', 'stripe_analytics',
  'shipping_carriers', 'shipping_tracking_events', 'order_fulfillment',
  'customer_addresses', 'order_returns', 'order_notes'
);
```

### 2. Check Seed Data
```sql
-- Verify shipping carriers were inserted
SELECT name, code FROM shipping_carriers WHERE is_active = true;

-- Verify email templates were inserted
SELECT template_key, name FROM email_templates WHERE is_active = true;
```

### 3. Check RLS Policies
```sql
-- Verify RLS is enabled on key tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'order_items', 'notifications');
```

## Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**
   - Ensure all referenced tables exist before running migrations
   - Check that the `auth.users` table is accessible

2. **Permission Errors**
   - Make sure you're running as a user with sufficient privileges
   - Some operations may require superuser access

3. **RLS Policy Conflicts**
   - If you have existing RLS policies, they may conflict
   - Review and adjust policies as needed

4. **Data Type Conflicts**
   - If you have existing data that doesn't match new constraints
   - Clean up data before running migrations

### Rollback Strategy

If you need to rollback:

1. **Restore from backup** (recommended)
2. **Manual cleanup** (advanced):
   ```sql
   -- Drop tables in reverse order
   DROP TABLE IF EXISTS order_notes CASCADE;
   DROP TABLE IF EXISTS order_returns CASCADE;
   -- ... continue in reverse order
   ```

## Next Steps

After successful migration:

1. **Update Application Code**
   - Update API routes to use new schema
   - Implement notification services
   - Add Stripe synchronization

2. **Configure Email Templates**
   - Customize email templates in the admin panel
   - Set up SendGrid integration

3. **Test Order Flow**
   - Place test orders
   - Verify notifications work
   - Test tracking updates

## Support

If you encounter issues:
1. Check the error messages carefully
2. Verify all prerequisites are met
3. Ensure migrations are run in the correct order
4. Contact support with specific error details

## Schema Changes Summary

**New Tables:** 15
**New Functions:** 8
**New Triggers:** 7
**New Indexes:** 45+
**New RLS Policies:** 25+

This migration significantly enhances the order management capabilities of your Mirror Exhibit platform.
