import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { useAuth } from '@clerk/nextjs';

/**
 * Create a Supabase client for server-side usage with Clerk authentication
 * This should be used in Server Components, API routes, and Server Actions
 */
export async function createServerSupabaseClient() {
  const { getToken } = await auth();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await getToken({ template: 'supabase' });
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }
  );
}

/**
 * Create a Supabase client for client-side usage with Clerk authentication
 * This should be used in Client Components and hooks
 */
export function createClientSupabaseClient() {
  const { getToken } = useAuth();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await getToken({ template: 'supabase' });
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }
  );
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
 * Get the current Clerk user ID from server context
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if the current user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  const userRole = sessionClaims?.metadata?.role || sessionClaims?.publicMetadata?.role;
  return userRole === 'admin';
}
