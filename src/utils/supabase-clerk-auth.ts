'use client';

import { createClient } from '@supabase/supabase-js';
import { useAuth, useUser } from '@clerk/nextjs';

/**
 * Create a Supabase client with proper Clerk integration
 * Following the official Supabase-Clerk integration guide
 */
export function useSupabaseWithClerk() {
  const { getToken, userId } = useAuth();
  const { user } = useUser();

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
            console.warn('Supabase token template temporarily disabled in supabase-clerk-auth for debugging');
            return {}; // Fall back to anonymous access
          } catch (error) {
            console.warn('Failed to get Clerk token for Supabase in supabase-clerk-auth:', error);
            // Return empty headers to fall back to anonymous access
            return {};
          }
        },
      },
      auth: {
        persistSession: false,
      },
    }
  );

  // Custom method to check if user is admin
  const isAdmin = () => {
    return user?.publicMetadata?.role === 'admin' ||
           user?.privateMetadata?.role === 'admin';
  };

  // Custom method to get user ID
  const getCurrentUserId = () => {
    return userId;
  };

  return {
    supabase,
    isAdmin,
    getCurrentUserId,
    user,
    userId,
  };
}
