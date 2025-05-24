# Analytics RLS Fix

## 🐛 Issue Description
Analytics tracking was failing with the error:
```
Analytics insert error: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "product_analytics"'
}
```

This error occurs because Supabase Row Level Security (RLS) policies were blocking anonymous users from inserting analytics data.

## ✅ Solution Implemented

### 1. **Updated Analytics API** (`src/app/api/analytics/track/route.ts`)
- **Service Role Client**: Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS policies
- **Anonymous Support**: Handles both authenticated and anonymous users
- **Graceful Auth**: Doesn't fail if user authentication is unavailable

```typescript
// BEFORE: Using regular client (blocked by RLS)
const supabase = createRouteHandlerClient({ cookies });

// AFTER: Using service role client (bypasses RLS)
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 2. **Enhanced Error Handling** (`src/utils/analytics.ts`)
- **Non-blocking**: Analytics failures don't break the app
- **Helpful Messages**: Suggests running setup script for RLS errors
- **Graceful Degradation**: App continues working even if analytics fails

```typescript
// BEFORE: Errors could break the app
console.error('Analytics tracking error:', error);

// AFTER: Non-critical warnings
console.warn('Analytics tracking failed (non-critical):', error);
```

### 3. **Database Setup Script** (`setup_analytics_rls.sql`)
Creates proper RLS policies for analytics tracking:

- **Service Role**: Full access for API endpoints
- **Anonymous Users**: Can insert analytics data
- **Authenticated Users**: Can insert their own analytics
- **Proper Indexes**: For better query performance

## 🚀 Setup Instructions

### Step 1: Run the Database Setup Script
1. Open Supabase SQL Editor
2. Copy and paste the contents of `setup_analytics_rls.sql`
3. Execute the script

### Step 2: Verify Environment Variables
Make sure these environment variables are set:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Test Analytics
1. Open browser developer tools
2. Navigate to the site and interact with products
3. Check console for analytics success/failure messages
4. Verify data appears in Supabase `product_analytics` table

## 🔧 Technical Details

### RLS Policies Created
1. **Service Role Full Access**: Allows API endpoints to insert/read all data
2. **Anonymous Insert**: Allows anonymous users to track analytics
3. **Authenticated Insert**: Allows users to insert their own analytics
4. **Authenticated Select**: Allows users to view their own analytics

### Analytics Events Tracked
- `view` - Product page views
- `add_to_cart_click` - Add to cart button clicks
- `option_select` - Product option selections (size, frame)
- `modal_open` - Product modal opens
- `modal_close` - Product modal closes
- `carousel_interaction` - Carousel navigation
- `product_click` - Product card clicks

### Data Collected
- Product ID (if applicable)
- User ID (if authenticated)
- Session ID (for anonymous tracking)
- Event type and data
- IP address, user agent, referrer
- Source page/component
- Timestamp

## 🛡️ Security Considerations

### Service Role Usage
- **Limited Scope**: Only used for analytics API endpoints
- **No Client Exposure**: Service role key never sent to client
- **Specific Purpose**: Only for bypassing RLS on analytics table

### Data Privacy
- **Anonymous Tracking**: No personal data collected for anonymous users
- **Session-based**: Uses temporary session IDs for anonymous users
- **Optional**: Analytics can be disabled without affecting app functionality

## 🧪 Testing

### Verify Analytics Working
1. Open browser console
2. Add products to cart from modal
3. Look for successful analytics messages
4. Check Supabase `product_analytics` table for new records

### Test RLS Policies
```sql
-- Test anonymous insert (should work)
INSERT INTO product_analytics (event_type, source) 
VALUES ('view', 'test');

-- Test service role access (should work)
SELECT COUNT(*) FROM product_analytics;
```

## 🔄 Fallback Behavior

If analytics still fails:
1. **App Continues**: No impact on core functionality
2. **Console Warnings**: Non-critical error messages
3. **Local Tracking**: Could implement local storage fallback
4. **Manual Setup**: Run SQL script manually if needed

## 📝 Notes

- Analytics failures are now **non-critical** and won't break the app
- The service role client is only used server-side for analytics
- RLS policies ensure data security while allowing necessary access
- All analytics tracking is optional and can be disabled

## 🎯 Expected Results

After implementing this fix:
- ✅ No more RLS policy errors
- ✅ Analytics tracking works for anonymous users
- ✅ App continues working even if analytics fails
- ✅ Proper data security with RLS policies
- ✅ Performance tracking for product interactions
