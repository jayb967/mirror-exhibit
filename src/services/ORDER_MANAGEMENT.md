# Enhanced Order Management Services

This document covers the new services implemented for comprehensive order management, notifications, and Stripe integration.

## New Services Overview

### 1. Email Service (`emailService.ts`)
**Purpose:** SendGrid integration for reliable email delivery

**Key Features:**
- Template-based email sending with variable substitution
- Email queue with retry logic for failed deliveries
- Queue status monitoring and processing
- Support for both immediate and scheduled email delivery

**Environment Variables Required:**
```env
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@mirrorexhibit.com
SENDGRID_FROM_NAME=Mirror Exhibit
```

### 2. Notification Service (`notificationService.ts`)
**Purpose:** In-app notifications and user preference management

**Key Features:**
- Create notifications for users and admins
- User notification preferences (email/in-app)
- Automatic email sending based on preferences
- Notification read/archive status management
- Admin notification system

### 3. Stripe Product Service (`stripeProductService.ts`)
**Purpose:** Synchronize products with Stripe for analytics

**Key Features:**
- Automatic product creation/update in Stripe
- Price change tracking and history
- Batch product synchronization
- Sync status monitoring
- Product archiving when discontinued

### 4. Order Tracking Service (`orderTrackingService.ts`)
**Purpose:** Comprehensive order status and tracking management

**Key Features:**
- Order status updates with automatic notifications
- Tracking event management (shipping updates)
- Fulfillment workflow for admins
- Order notes and communication history
- Complete audit trail of status changes

## Integration Points

### Database Tables Used
- `notifications` - In-app notifications
- `email_templates` - Email template management
- `email_queue` - Reliable email delivery
- `notification_preferences` - User email preferences
- `stripe_products` - Product synchronization
- `stripe_webhooks` - Webhook event logging
- `order_status_history` - Status change audit trail
- `shipping_tracking_events` - Detailed tracking events

### API Routes Created
- `GET /api/notifications` - User notifications
- `PATCH /api/notifications/[id]` - Mark read/archive
- `GET /api/admin/notifications` - Admin notifications
- Enhanced `POST /api/webhooks/stripe` - Stripe webhook processing

### Enhanced Stripe Webhook
The Stripe webhook now:
- Logs all events to `stripe_webhooks` table
- Uses `orderTrackingService` for status updates
- Sends admin notifications for new orders
- Creates payment intent records
- Triggers customer notifications automatically

## Usage Examples

### Send Order Confirmation
```typescript
import { notificationService } from '@/services/notificationService';

await notificationService.createNotification({
  type: 'order_confirmation',
  title: 'Order Confirmed',
  message: 'Your order has been confirmed!',
  actionUrl: '/dashboard/orders/123'
}, {
  userId: 'user_123',
  sendEmail: true,
  emailTemplate: 'order_confirmation',
  emailData: {
    customer_name: 'John Doe',
    order_number: '12345',
    total_amount: '99.99'
  }
});
```

### Update Order Status
```typescript
import { orderTrackingService } from '@/services/orderTrackingService';

await orderTrackingService.updateOrderStatus({
  orderId: 'order_123',
  newStatus: 'shipped',
  trackingNumber: '1Z999AA1234567890',
  carrierName: 'UPS',
  estimatedDelivery: '2024-01-15'
});
```

### Sync Product with Stripe
```typescript
import { stripeProductService } from '@/services/stripeProductService';

await stripeProductService.syncProduct({
  productId: 'prod_123',
  name: 'Mirror Frame - Large',
  priceCents: 9999,
  description: 'Beautiful large mirror frame'
});
```

## Email Templates Available

The system includes these pre-configured email templates:
- `order_confirmation` - Order placed confirmation
- `order_shipped` - Shipping notification with tracking
- `order_delivered` - Delivery confirmation
- `order_status_update` - Generic status updates
- `admin_new_order` - Admin alert for new orders

## Notification Types

### User Notifications
- `order_confirmation` - Order confirmed
- `order_status_update` - Status changes
- `shipping_notification` - Shipped with tracking
- `delivery_confirmation` - Package delivered
- `payment_confirmation` - Payment processed

### Admin Notifications
- `admin_new_order` - New order received
- `admin_low_stock` - Inventory alerts
- `admin_system_alert` - System notifications

## Background Processing

### Email Queue Processing
Set up a cron job or background worker to process the email queue:

```typescript
import { emailService } from '@/services/emailService';

// Process pending emails (call this every minute)
const result = await emailService.processEmailQueue(10);
console.log(`Processed ${result.processed} emails, ${result.errors.length} errors`);
```

## Error Handling

All services include:
- Graceful error handling with detailed logging
- Fallback behaviors when external services fail
- Retry mechanisms for transient failures
- Comprehensive error messages for debugging

## Security Considerations

- All API routes require Clerk authentication
- Admin routes include role-based access control
- Database operations respect RLS policies
- Sensitive data is properly sanitized
- Webhook signatures are verified

## Monitoring and Debugging

### Check Email Queue Status
```typescript
const status = await emailService.getQueueStatus();
// Returns: { pending: 5, processing: 1, failed: 2, sent_today: 150 }
```

### View Webhook Logs
Check the `stripe_webhooks` table for webhook processing status and any errors.

### Monitor Notification Delivery
Check the `notifications` table for delivery status and user engagement.

## Next Implementation Steps

1. **Customer Dashboard** - Create user-facing order tracking
2. **Admin Notification Center** - Real-time admin notifications
3. **Background Jobs** - Set up email queue processing
4. **Real-time Updates** - WebSocket notifications
5. **Analytics Dashboard** - Order and notification metrics

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SENDGRID_API_KEY is set correctly
   - Verify sender email is verified in SendGrid
   - Check email_queue table for failed emails

2. **Notifications not appearing**
   - Verify user_id format matches Clerk user IDs
   - Check notification_preferences table
   - Ensure RLS policies allow access

3. **Stripe sync failing**
   - Verify STRIPE_SECRET_KEY is correct
   - Check stripe_products table for sync errors
   - Monitor stripe_webhooks for processing issues

### Debug Commands

```sql
-- Check recent notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Check email queue status
SELECT status, COUNT(*) FROM email_queue GROUP BY status;

-- Check Stripe sync status
SELECT sync_status, COUNT(*) FROM stripe_products GROUP BY sync_status;

-- Check webhook processing
SELECT processed, COUNT(*) FROM stripe_webhooks GROUP BY processed;
```
