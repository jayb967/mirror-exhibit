'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useClerkAuth'
import { ProtectedRouteConfig } from '@/types/auth'
import { useClerk } from '@clerk/nextjs'

// Loading component
const DefaultLoadingComponent = () => (
  <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-gray-50">
    <div className="tw-text-center">
      <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2 tw-border-[#A6A182] tw-mx-auto"></div>
      <p className="tw-mt-4 tw-text-gray-600">Loading...</p>
    </div>
  </div>
);

// Unauthorized component
const UnauthorizedComponent = ({ message }: { message: string }) => (
  <div className="tw-min-h-screen tw-flex tw-items-center tw-justify-center tw-bg-gray-50">
    <div className="tw-text-center tw-max-w-md tw-mx-auto tw-p-6">
      <div className="tw-bg-red-100 tw-border tw-border-red-400 tw-text-red-700 tw-px-4 tw-py-3 tw-rounded tw-mb-4">
        <strong className="tw-font-bold">Access Denied!</strong>
        <span className="tw-block tw-sm:inline tw-ml-2">{message}</span>
      </div>
      <button
        onClick={() => window.history.back()}
        className="tw-bg-[#A6A182] tw-text-white tw-px-4 tw-py-2 tw-rounded tw-hover:bg-[#959070] tw-transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: ProtectedRouteConfig
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter()
    const { isAuthenticated, isAdmin, isLoading } = useAuth()
    const { openSignIn } = useClerk()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    useEffect(() => {
      if (!mounted || isLoading) return

      console.log('🔍 STEP10 AUTH CHECK:', {
        isAuthenticated,
        isAdmin,
        requireAuth: config.requireAuth,
        allowedRoles: config.allowedRoles,
        pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
      })

      if (config.requireAuth && !isAuthenticated) {
        console.log('🔍 STEP10 AUTH: Not authenticated - opening sign in')
        // Use Clerk modal instead of redirecting to a page
        openSignIn({
          redirectUrl: typeof window !== 'undefined' ? window.location.href : '/',
        })
        return
      }

      if (config.allowedRoles) {
        if (config.allowedRoles.includes('admin') && !isAdmin) {
          console.log('🔍 STEP10 AUTH: Not admin - redirecting to unauthorized')
          router.push('/unauthorized')
          return
        }
      }
    }, [mounted, isLoading, isAuthenticated, isAdmin, router, openSignIn, config])

    // Don't render anything until mounted (prevents hydration issues)
    if (!mounted) {
      return null
    }

    // Show loading while auth is being determined
    if (isLoading) {
      return <DefaultLoadingComponent />
    }

    // Check authentication
    if (config.requireAuth && !isAuthenticated) {
      return <UnauthorizedComponent message="You must be signed in to access this page." />
    }

    // Check role-based authorization
    if (config.allowedRoles?.includes('admin') && !isAdmin) {
      return <UnauthorizedComponent message="You must be an administrator to access this page." />
    }

    console.log('🔍 STEP10 AUTH: All checks passed - rendering component')
    return <WrappedComponent {...props} />
  }
}

// Convenience HOCs for common use cases
export const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) =>
  withAuth(WrappedComponent, {
    requireAuth: true,
    allowedRoles: ['admin']
  })

export const withUserAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) =>
  withAuth(WrappedComponent, {
    requireAuth: true
  })