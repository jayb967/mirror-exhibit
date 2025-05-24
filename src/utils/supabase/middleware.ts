import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { UserRole } from '@/types/auth'

// Define protected routes and their requirements
const protectedRoutes: Record<string, { requireAuth: boolean; allowedRoles?: UserRole[] }> = {
  '/admin': { requireAuth: true, allowedRoles: ['admin'] },
  '/admin/dashboard': { requireAuth: true, allowedRoles: ['admin'] },
  '/profile': { requireAuth: true },
  '/checkout': { requireAuth: true },
  '/orders': { requireAuth: true },
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Check if the current path requires authentication
  const path = request.nextUrl.pathname
  const routeConfig = protectedRoutes[path]

  if (routeConfig) {
    // If authentication is required and user is not logged in
    if (routeConfig.requireAuth && !user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', path)
      return NextResponse.redirect(redirectUrl)
    }

    // If role-based access is required
    if (routeConfig.allowedRoles && user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const userRole = profile?.role as UserRole

      // If user's role is not allowed
      if (!routeConfig.allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return response
} 