import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ProtectedRouteConfig } from '@/types/auth'

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: ProtectedRouteConfig
) {
  return function WithAuthComponent(props: P) {
    const router = useRouter()
    const { isAuthenticated, isAdmin, isLoading } = useAuth()

    useEffect(() => {
      if (!isLoading) {
        if (config.requireAuth && !isAuthenticated) {
          router.push('/login')
          return
        }

        if (config.allowedRoles) {
          if (config.allowedRoles.includes('admin') && !isAdmin) {
            router.push('/')
            return
          }
        }
      }
    }, [isLoading, isAuthenticated, isAdmin, router])

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