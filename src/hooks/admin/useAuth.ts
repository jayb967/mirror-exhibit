"use client";

import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role?: string;
}

export function useAuth() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { openSignIn, signOut } = useClerk();
  const router = useRouter();

  // Convert Clerk user to our User format
  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    role: (clerkUser.publicMetadata?.role as string) ||
          (clerkUser.privateMetadata?.role as string) ||
          'customer',
  } : null;

  const loading = !isLoaded;

  async function login(email: string, password: string) {
    // For Clerk, we'll open the sign-in modal instead of handling credentials directly
    openSignIn({
      redirectUrl: '/admin/dashboard',
    });
  }

  async function logout() {
    try {
      await signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!isSignedIn,
  };
}