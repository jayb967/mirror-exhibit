'use client';

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

/**
 * Create a Supabase client for client-side usage with Clerk authentication
 * This should ONLY be used inside React components as a hook
 * @deprecated Use useSupabaseClient() hook instead
 */
export function createClientSupabaseClient() {
  throw new Error('createClientSupabaseClient() cannot be called outside React components. Use useSupabaseClient() hook instead.');
}

/**
 * Create a Supabase client with admin privileges (service role)
 * This bypasses RLS policies and should only be used for admin operations
 * Note: This exposes the service role key to the client, use with caution
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
 * Hook to create a Supabase client with Clerk authentication
 * This is a React hook that can be used in components
 * Uses the new Clerk-Supabase integration (no JWT templates needed)
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          try {
            // TEMPORARILY DISABLED: Supabase token template to isolate constructor error
            // const token = await getToken({ template: 'supabase' });
            // return token ? { Authorization: `Bearer ${token}` } : {};
            console.warn('Supabase token template temporarily disabled in supabase-client for debugging');
            return {}; // Fall back to anonymous access
          } catch (error) {
            console.warn('Failed to get Clerk token for Supabase:', error);
            // Return empty headers to fall back to anonymous access
            return {};
          }
        },
      },
    }
  );

  return supabase;
}
