import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useClerkAuth'
import { ProtectedRouteConfig } from '@/types/auth'
import { useClerk } from '@clerk/nextjs'

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: ProtectedRouteConfig
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter()
    const { isAuthenticated, isAdmin, isLoading } = useAuth()
    const { openSignIn } = useClerk()

    useEffect(() => {
      if (!isLoading) {
        if (config.requireAuth && !isAuthenticated) {
          // Use Clerk modal instead of redirecting to a page
          openSignIn({
            redirectUrl: window.location.href,
          })
          return
        }

        if (config.allowedRoles) {
          if (config.allowedRoles.includes('admin') && !isAdmin) {
            router.push('/')
            return
          }
        }
      }
    }, [isLoading, isAuthenticated, isAdmin, router, openSignIn])

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (config.requireAuth && !isAuthenticated) {
      return null
    }

    if (config.allowedRoles?.includes('admin') && !isAdmin) {
      return null
    }

    return <WrappedComponent {...props} />
  }
}