import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

/**
 * Create a Supabase client for server-side usage with Clerk authentication
 * This should be used in Server Components, API routes, and Server Actions
 */
export async function createServerSupabaseClient() {
  try {
    const { getToken } = await auth();

    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: async () => {
            try {
              // TEMPORARILY DISABLED: Supabase token template to isolate constructor error
              // const token = await getToken({ template: 'supabase' });
              // return token ? { Authorization: `Bearer ${token}` } : {};
              console.warn('Supabase token template temporarily disabled in clerk-supabase for debugging');
              return {}; // Fall back to anonymous access
            } catch (error) {
              // If token retrieval fails, return empty headers (unauthenticated)
              if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to get Clerk token:', error);
              }
              return {};
            }
          },
        },
      }
    );
  } catch (error) {
    // If auth context is not available, fall back to public client
    // This can happen during static generation or when called outside request context
    if (process.env.NODE_ENV === 'development') {
      console.warn('Clerk auth context not available, falling back to public client:', error);
    }
    return createPublicSupabaseClient();
  }
}



/**
 * Create a Supabase client with admin privileges (service role)
 * This bypasses RLS policies and should only be used for admin operations
 */
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Create a public Supabase client for read-only public data
 * This uses the anon key and is safe for public product access
 */
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Create a Supabase client with service role privileges
 * This is an alias for createAdminSupabaseClient for backward compatibility
 * @deprecated Use createAdminSupabaseClient() instead
 */
export function createServiceRoleSupabaseClient() {
  console.warn('createServiceRoleSupabaseClient is deprecated. Use createAdminSupabaseClient instead.');
  return createAdminSupabaseClient();
}

/**
 * Get the current Clerk user ID from server context
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to get current user ID:', error);
    }
    return null;
  }
}

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { sessionClaims } = await auth();
    const userRole = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role;
    return userRole === 'admin';
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to check admin status:', error);
    }
    return false;
  }
}
