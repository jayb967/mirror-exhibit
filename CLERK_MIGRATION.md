# Clerk Authentication Migration Guide

This document outlines the migration from Supabase Auth to Clerk authentication while maintaining Supabase database integration and guest cart functionality.

## Migration Status

### ✅ Completed
- [x] Updated middleware to use Clerk with proper admin role checking
- [x] Added ClerkProvider to app layout
- [x] Created Clerk-Supabase integration utilities
- [x] Updated admin login page to use Clerk modals
- [x] Updated admin auth hook to use Clerk
- [x] Updated CreateAccountBanner to use Clerk
- [x] Updated Redux cart slice for Clerk compatibility
- [x] Created RLS policy updates for Clerk JWT tokens
- [x] Updated withAuth HOC to use Clerk modals instead of page redirects
- [x] Created unauthorized page for non-admin users
- [x] Created admin setup utilities and API route
- [x] Enhanced role checking to support both publicMetadata and privateMetadata

### 🔄 In Progress
- [x] Update cart service to use Clerk authentication (completed)
- [x] Update checkout components to use Clerk (completed)
- [x] Fixed cart tracking service for Clerk compatibility
- [x] Fixed shipping service to handle missing shipping_rules table
- [x] Added profile icon to navbar with Clerk authentication
- [ ] Test guest cart functionality with Clerk
- [ ] Test admin dashboard with Clerk

### ✅ Completed
- [x] Remove old Supabase auth code
- [x] Update remaining auth components
- [x] Update API routes to use Clerk
- [x] Clean up unused dependencies

## Key Changes Made

### 1. Middleware (`middleware.ts`)
- Replaced Supabase middleware with `clerkMiddleware`
- Updated route protection logic
- Maintained admin role checking

### 2. App Layout (`src/app/layout.tsx`)
- Added `ClerkProvider` wrapper
- Maintained existing app structure

### 3. Authentication Utilities
- Created `src/utils/clerk-supabase.ts` for Clerk-Supabase integration
- Created `src/utils/auth-helpers.ts` for client-side auth helpers
- Created `src/hooks/useClerkAuth.ts` for unified auth interface

### 4. Admin Authentication
- Updated `src/hooks/admin/useAuth.ts` to use Clerk
- Updated `src/app/admin/login/page.tsx` to use Clerk modals
- Maintained compatibility with existing admin components

### 5. Guest Cart Functionality
- Updated Redux cart slice to work without Supabase auth
- Created anonymous user system for guest carts
- Updated RLS policies to work with Clerk JWT tokens

### 6. Database Integration
- Created SQL migration for Clerk-compatible RLS policies
- Added functions for Clerk user management
- Maintained guest user functionality

### 7. Bug Fixes and Improvements
- Fixed CheckoutArea anonymous user initialization to work without Supabase auth
- Updated cart tracking service to handle Clerk authentication properly
- Fixed shipping service to gracefully handle missing shipping_rules table
- Added comprehensive error handling for database operations
- Created ProfileButtonComponent with dropdown menu for authentication
- Fixed cart_tracking table upsert operations by replacing ON CONFLICT with manual check-and-update
- Added proper unique constraints to cart_tracking table for guest_token
- Created guest_users table with proper structure for Clerk integration
- Added database functions for anonymous user creation and guest-to-user conversion

### 8. User Interface Enhancements
- Added profile icon to HeaderFive navbar (next to cart icon)
- Profile dropdown shows different options for authenticated vs guest users
- Integrated Clerk modals for sign-in/sign-up instead of custom pages
- Maintained existing design consistency with theme colors

### 9. Complete Code Migration
- **Removed old Supabase auth files**: `src/hooks/useAuth.ts`, `src/utils/supabase/middleware.ts`
- **Updated all API routes**: Replaced `createRouteHandlerClient` with Clerk's `auth()` function
- **Updated services**: ProductImportService, StoreProvider, lib/supabase.ts to use direct Supabase clients
- **Cleaned dependencies**: Removed `@supabase/auth-helpers-nextjs` from package.json
- **Updated type declarations**: Removed unused Supabase auth module declarations
- **Fixed cart tracking**: Replaced ALL `upsert` operations with manual check-and-update logic (including CheckoutArea guest user creation)
- **Removed shipping_rules dependency**: Updated shipping service to use admin settings instead of non-existent shipping_rules table
- **Added origin address configuration**: Shipping service now gets origin address from admin settings for Easyship integration
- **Created site_settings table**: Comprehensive admin settings table for shipping, tax, store info, and Easyship configuration
- **Updated admin settings page**: Fixed to use Clerk auth and manual upsert operations
- **Fixed StoreProvider**: Removed old Supabase auth dependency and updated to use Clerk auth state monitoring
- **Cleaned up unused tables**: Removed guest_users and guest_cart_items tables since cart_tracking handles all guest functionality
- **Fixed is_anonymous logic**: Automatically sets is_anonymous=true only when user_id is null AND guest_token exists
- **Added guest-to-user conversion**: Automatically converts guest carts to user carts when signing in/up during checkout

## Environment Variables Required

```env
# Clerk Configuration (already added)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Configuration (existing)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Supabase Setup Required

1. **Enable Clerk as Third-Party Auth Provider**
   - Go to Supabase Dashboard > Authentication > Sign In / Up
   - Add Clerk as a provider
   - Use your Clerk domain from the Clerk Dashboard

2. **Run Database Migrations**
   ```sql
   -- Run these migration files in order:
   -- 1. supabase/migrations/20240502000000_clerk_integration.sql
   -- 2. supabase/migrations/20240502000001_fix_cart_tracking.sql
   -- 3. supabase/migrations/20240502000002_create_site_settings.sql
   -- 4. supabase/migrations/20240502000003_fix_cart_tracking_rls.sql
   -- 5. supabase/migrations/20240502000004_cleanup_unused_tables.sql
   -- 6. supabase/migrations/20240502000005_fix_is_anonymous_and_conversion.sql
   ```

   Or run them via Supabase CLI:
   ```bash
   supabase db push
   ```

3. **Update JWT Template (if needed)**
   - In Clerk Dashboard, go to JWT Templates
   - Create a Supabase template if not already done
   - Ensure it includes the `role: "authenticated"` claim

## Admin Role Setup

### Setting Up Your First Admin User

1. **Sign up/Sign in to your application** using Clerk
2. **Get your User ID** from the Clerk Dashboard or by calling the setup API
3. **Use the Admin Setup API** to promote your user to admin:

```bash
# Method 1: Promote yourself (when signed in)
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{}'

# Method 2: Check your current role
curl -X GET http://localhost:3000/api/admin/setup
```

4. **Verify admin access** by trying to access `/admin/dashboard`

### Admin Role Management

- **Roles are stored** in Clerk's `publicMetadata.role` field
- **Supported roles**: `admin`, `customer` (default)
- **Role checking** happens in middleware and auth hooks
- **Fallback**: Users without explicit roles default to `customer`

### Security Notes

- The `/api/admin/setup` route should be secured or removed in production
- Consider adding a setup key for additional security
- Admin roles are checked at multiple levels (middleware, components, hooks)

## Testing Checklist

### Admin Authentication
- [ ] Admin login redirects to Clerk modal
- [ ] Admin can sign in successfully
- [ ] Admin dashboard is accessible after login
- [ ] Admin logout works correctly
- [ ] Non-admin users are blocked from admin routes
- [ ] Admin role setup API works correctly

### Guest Cart Functionality
- [ ] Guest users can add items to cart
- [ ] Cart persists in local storage
- [ ] Cart syncs to database when available
- [ ] Guest checkout works without authentication

### User Authentication
- [ ] Users can sign up via Clerk
- [ ] Users can sign in via Clerk
- [ ] User profile data is accessible
- [ ] Cart converts from guest to user on login

### Database Integration
- [ ] RLS policies work with Clerk JWT tokens
- [ ] User data is properly isolated
- [ ] Guest data is accessible with guest tokens
- [ ] Cart conversion works correctly

## Troubleshooting

### If Cart Tracking Errors Persist (406/409 errors)

If you're still seeing cart tracking errors, you can temporarily disable it:

1. **Add to your `.env.local` file**:
   ```env
   NEXT_PUBLIC_DISABLE_CART_TRACKING=true
   ```

2. **This will**:
   - Allow cart operations to work normally
   - Skip all cart tracking database operations
   - Not affect core cart functionality

3. **Re-enable after running migrations**:
   - Run all 4 migration files in order
   - Remove or set `NEXT_PUBLIC_DISABLE_CART_TRACKING=false`
   - Cart tracking will resume working

### Common Issues

1. **RLS Policies**: Make sure all 4 migrations are run in order
2. **Anonymous Access**: Migration 4 allows anonymous users to access cart_tracking
3. **Unique Constraints**: Migration 2 adds proper unique constraints to prevent conflicts
4. **Supabase Auth**: Make sure you're using the correct Supabase project and API keys

## Known Issues & Limitations

1. **Redux Cart Slice**: Currently simplified to work primarily with guest tokens. Full Clerk integration in Redux needs additional work.

2. **Cart Service**: Still uses some Supabase auth patterns. Needs update to use Clerk authentication.

3. **API Routes**: Some API routes may still expect Supabase auth. Need to update to use Clerk.

## Next Steps

1. **Complete Cart Service Migration**
   - Update `src/services/cartService.ts` to use Clerk auth
   - Test cart functionality with authenticated users

2. **Update Remaining Components**
   - Update checkout components
   - Update user profile components
   - Update any remaining auth-dependent components

3. **Clean Up**
   - Remove unused Supabase auth imports
   - Remove old auth components
   - Update package.json dependencies

4. **Testing**
   - Comprehensive testing of all auth flows
   - Test guest-to-user cart conversion
   - Test admin functionality

## Rollback Plan

If issues arise, you can rollback by:
1. Reverting the middleware changes
2. Removing ClerkProvider from layout
3. Restoring original auth hooks
4. Reverting database migrations

The old Supabase auth code is preserved in git history for reference.
