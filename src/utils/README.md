# Utils

## 📌 Purpose
This folder contains utility functions and helpers that provide common functionality across the Mirror Exhibit application, including authentication, database integration, and admin operations.

## 📂 Files Overview
- `admin-auth.ts` - **🛡️ NEW** Centralized admin authentication and role verification utilities
- `clerk-supabase.ts` - **SERVER-SIDE** Clerk-Supabase integration utilities for server components and API routes
- `supabase-client.ts` - **CLIENT-SIDE** Clerk-Supabase integration utilities for client components
- `auth-helpers.ts` - Client-side authentication helper functions and hooks
- `admin-setup.ts` - Admin user management utilities for Clerk

## 🧩 Key Utilities

### admin-auth.ts 🛡️ **NEW - CENTRALIZED ADMIN AUTH**
- **Purpose:** Centralized admin authentication and role verification for all admin API routes
- **Usage:** Import in admin API routes for consistent authentication
- **Functions:**
  - `verifyAdminAccess(options?)` - Primary admin auth function for API routes
  - `isUserAdmin(userId?)` - Simple boolean admin check
  - `getUserRole(userId?)` - Get user role from Clerk
- **Key Features:**
  - JWT + Clerk API fallback for reliable role detection
  - Detailed logging with operation context
  - Proper HTTP error responses (401/403/500)
  - TypeScript support with full type safety
  - Consistent across all admin operations

**Usage Example:**
```typescript
import { verifyAdminAccess } from '@/utils/admin-auth';

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminAccess({
    operation: 'create products'
  });

  if (!authResult.success) {
    return authResult.error; // Returns proper HTTP error
  }

  // Continue with admin logic...
  const { userId, userRole } = authResult;
}
```

### supabase-client.ts ⭐ **CLIENT-SIDE ONLY**
- **Purpose:** Provides Clerk-authenticated Supabase clients for client components
- **Usage:** Import in client components that need database access
- **Functions:**
  - `createClientSupabaseClient()` - Creates authenticated Supabase client
  - `createAdminSupabaseClient()` - Creates admin-privileged client (use with caution)
  - `useSupabaseClient()` - React hook for Supabase client
- **Key Features:**
  - Automatically includes Clerk JWT tokens in Supabase requests
  - Works with Supabase RLS policies
  - Client-side safe (no server-only imports)

### clerk-supabase.ts 🖥️ **SERVER-SIDE ONLY**
- **Purpose:** Provides Clerk-authenticated Supabase clients for server components and API routes
- **Usage:** Import in server components, API routes, and server actions
- **Functions:**
  - `createServerSupabaseClient()` - Server-side authenticated client
  - `createAdminSupabaseClient()` - Admin-privileged client
  - `getCurrentUserId()` - Get current Clerk user ID
  - `isCurrentUserAdmin()` - Check if current user is admin
- **Key Features:**
  - Uses server-side Clerk auth context
  - Bypasses RLS with service role when needed
  - Server-side safe

### auth-helpers.ts 👤 **CLIENT-SIDE**
- **Purpose:** Client-side authentication utilities and hooks
- **Usage:** Import in client components for auth operations
- **Functions:**
  - `useSupabaseClient()` - Hook for authenticated Supabase client
- **Key Features:**
  - React hooks for authentication
  - Client-side auth state management

### admin-setup.ts 🔧 **SERVER-SIDE**
- **Purpose:** Admin user management and role assignment
- **Usage:** Import in API routes for admin operations
- **Functions:**
  - `setUserAsAdmin(userId)` - Promote user to admin
  - `removeAdminRole(userId)` - Remove admin role
  - `isUserAdmin(userId)` - Check if user is admin
  - `getAllAdminUsers()` - Get all admin users
- **Key Features:**
  - Uses Clerk backend API
  - Server-side role management
  - Type-safe admin operations

## 🔧 Integration Architecture

### Client Components (React Components)
```typescript
// ✅ Use this in client components
import { createClientSupabaseClient } from '@/utils/supabase-client';

const MyComponent = () => {
  const supabase = createClientSupabaseClient();
  // Use supabase for database operations
};
```

### Server Components & API Routes
```typescript
// ✅ Use this in server components and API routes
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  // Use supabase for database operations
}
```

## 🚨 Important Notes

### File Separation Reason
- **Problem:** Mixing server and client imports causes "server-only" errors
- **Solution:** Separate files for server-side and client-side utilities
- **Rule:** Never import `clerk-supabase.ts` in client components
- **Rule:** Never import `supabase-client.ts` in server components

### Authentication Flow
1. **User signs in** via Clerk
2. **Clerk generates JWT** with user metadata
3. **JWT is sent to Supabase** as Authorization header
4. **Supabase RLS policies** validate the JWT and allow/deny access
5. **Database operations** work with proper user context

### Admin Operations
- **Client-side admin check:** Use `useAuth()` hook from `useClerkAuth.ts`
- **Server-side admin check:** Use `isCurrentUserAdmin()` from `clerk-supabase.ts`
- **Admin role management:** Use functions from `admin-setup.ts`

## 🔄 Recent Changes

| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | **🛡️ NEW:** Created centralized admin authentication utilities (admin-auth.ts) | Standardize admin auth across all API routes with JWT + Clerk API fallback |
| 2025-01-27 | Updated all admin API routes to use verifyAdminAccess() | Fix 403 Forbidden errors and ensure consistent admin role checking |
| 2025-01-27 | **MAJOR:** Created separate client-only Supabase utilities | Fix server-only import errors in client components |
| 2025-01-27 | Added supabase-client.ts for client-side Clerk-Supabase integration | Separate client and server utilities to avoid import conflicts |
| 2025-01-27 | Updated all admin pages to use client-only Supabase client | Fix compilation errors and enable proper authentication |
| 2025-01-27 | Created Clerk-Supabase integration utilities | Enable Supabase database access with Clerk authentication |
| 2025-01-27 | Added server and client-side Supabase client creators | Support both server components and client components |

## 🎯 Usage Examples

### Client Component Database Query
```typescript
'use client';
import { createClientSupabaseClient } from '@/utils/supabase-client';

export default function ProductList() {
  const supabase = createClientSupabaseClient();

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    return data;
  };
}
```

### API Route with Admin Check
```typescript
import { createServerSupabaseClient, isCurrentUserAdmin } from '@/utils/clerk-supabase';

export async function POST() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = await createServerSupabaseClient();
  // Perform admin operations
}
```

### Admin Role Management
```typescript
import { setUserAsAdmin } from '@/utils/admin-setup';

export async function POST(req: Request) {
  const { userId } = await req.json();
  const success = await setUserAsAdmin(userId);
  return Response.json({ success });
}
```
