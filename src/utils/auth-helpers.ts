'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

/**
 * Hook to create a Supabase client with Clerk authentication
 * This should be used in client components
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
            console.warn('Supabase token template temporarily disabled in auth-helpers for debugging');
            return {}; // Fall back to anonymous access
          } catch (error) {
            console.warn('Failed to get Clerk token for Supabase in auth-helpers:', error);
            // Return empty headers to fall back to anonymous access
            return {};
          }
        },
      },
    }
  );

  return supabase;
}

/**
 * Hook to get current user information from Clerk
 */
export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();

  return {
    user: user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      role: (user.publicMetadata?.role as 'admin' | 'customer') || 'customer',
      full_name: user.fullName || '',
      phone: user.phoneNumbers[0]?.phoneNumber || '',
    } : null,
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    isAdmin: user?.publicMetadata?.role === 'admin',
  };
}

/**
 * Create anonymous user for guest cart functionality
 * This replaces the Supabase anonymous auth with a custom implementation
 */
export async function createAnonymousUser(): Promise<{ id: string } | null> {
  try {
    // For guest users, we'll use a combination of guest token and timestamp
    // This creates a pseudo-user ID that can be used for cart tracking
    const guestToken = localStorage.getItem('guest_token') || '';
    const timestamp = Date.now();
    const anonymousId = `guest_${guestToken}_${timestamp}`;

    // Store the anonymous ID for this session
    sessionStorage.setItem('anonymous_user_id', anonymousId);

    return { id: anonymousId };
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    return null;
  }
}

/**
 * Get the current anonymous user ID if it exists
 */
export function getAnonymousUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('anonymous_user_id');
}
