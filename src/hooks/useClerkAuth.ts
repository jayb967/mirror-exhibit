'use client';

import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { UserProfile, AuthState } from '@/types/auth';

/**
 * Custom hook that provides Clerk authentication functionality
 * with compatibility for the existing auth interface
 */
export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signIn: () => void;
  signUp: () => void;
} {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, getToken } = useClerkAuth();
  const { openSignIn, openSignUp, signOut } = useClerk();
  const router = useRouter();

  // Convert Clerk user to our UserProfile format
  const userProfile: UserProfile | null = user ? {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    role: (user.publicMetadata?.role as 'admin' | 'customer') ||
          (user.privateMetadata?.role as 'admin' | 'customer') ||
          'customer',
    full_name: user.fullName || '',
    phone: user.phoneNumbers[0]?.phoneNumber || '',
    address: user.publicMetadata?.address as any || undefined,
    created_at: user.createdAt?.toISOString() || '',
    updated_at: user.updatedAt?.toISOString() || '',
  } : null;

  const isAdmin = userProfile?.role === 'admin';

  // Debug logging for role detection (can be removed in production)
  // if (user && userLoaded) {
  //   console.log('🎯 CLIENT-SIDE AUTH DEBUG:', {
  //     userId: user.id,
  //     email: user.emailAddresses[0]?.emailAddress,
  //     publicMetadata: user.publicMetadata,
  //     privateMetadata: user.privateMetadata,
  //     detectedRole: userProfile?.role,
  //     isAdmin: isAdmin,
  //     source: 'useClerkAuth hook'
  //   });
  // }

  const authState: AuthState = {
    user: userProfile,
    isAuthenticated: !!isSignedIn,
    isAdmin,
    isLoading: !userLoaded,
    error: null,
  };

  // Legacy login function for compatibility
  const login = async (email: string, password: string) => {
    // For Clerk, we'll redirect to the sign-in modal instead
    openSignIn({
      redirectUrl: '/admin/dashboard',
    });
  };

  // Legacy logout function for compatibility
  const logout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  // Open Clerk sign-in modal
  const signIn = () => {
    openSignIn();
  };

  // Open Clerk sign-up modal
  const signUp = () => {
    openSignUp();
  };

  return {
    ...authState,
    login,
    logout,
    signIn,
    signUp,
  };
}

/**
 * Hook to get Supabase token from Clerk
 */
export function useSupabaseToken() {
  const { getToken } = useClerkAuth();

  const getSupabaseToken = async () => {
    try {
      return await getToken({ template: 'supabase' });
    } catch (error) {
      console.error('Error getting Supabase token:', error);
      return null;
    }
  };

  return { getSupabaseToken };
}
