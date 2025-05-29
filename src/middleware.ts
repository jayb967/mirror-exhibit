import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// STEP 10: CUSTOM ROUTE PROTECTION WITHOUT CLERK MIDDLEWARE
// This implements route protection without using the problematic clerkMiddleware wrapper
// Uses cookie-based auth detection and redirects for protection

// CONFIGURATION
const ENABLE_ROUTE_PROTECTION = true;

// Protected route patterns
const ADMIN_ROUTES = ['/admin'];
const DASHBOARD_ROUTES = ['/dashboard'];
const PUBLIC_ROUTES = ['/admin/login', '/sign-in', '/sign-up', '/', '/shop', '/product', '/about-us', '/contact', '/faq'];

// Helper function to check if route matches pattern
function matchesRoute(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => pathname.startsWith(pattern));
}

// Helper function to check if route is public
function isPublicRoute(pathname: string): boolean {
  // Allow all API routes to pass through (they have their own protection)
  if (pathname.startsWith('/api/')) return true;

  // Allow static files and Next.js internals
  if (pathname.startsWith('/_next/') || pathname.includes('.')) return true;

  // Check against public route patterns
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });
}

// Helper function to extract auth info from cookies
function getAuthFromCookies(req: NextRequest) {
  const sessionCookie = req.cookies.get('__session')?.value;
  const clerkSessionCookie = req.cookies.get('__clerk_session')?.value;

  // Check for any Clerk-related cookies that indicate authentication
  let hasClerkAuth = false;
  req.cookies.getAll().forEach(cookie => {
    if (cookie.name.startsWith('__clerk') || cookie.name.includes('clerk')) {
      hasClerkAuth = true;
    }
  });

  return {
    hasSession: !!(sessionCookie || clerkSessionCookie || hasClerkAuth),
    sessionCookie,
    clerkSessionCookie,
    hasClerkAuth
  };
}

// STEP 10: CUSTOM ROUTE PROTECTION MIDDLEWARE
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log('🔍 STEP10 MIDDLEWARE: Custom route protection for:', pathname);

  if (!ENABLE_ROUTE_PROTECTION) {
    console.log('🔍 STEP10 MIDDLEWARE: Route protection disabled - allowing all requests');
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log('🔍 STEP10 MIDDLEWARE: Public route - allowing access');
    return NextResponse.next();
  }

  // Get auth info from cookies
  const authInfo = getAuthFromCookies(req);
  console.log('🔍 STEP10 MIDDLEWARE: Auth info:', {
    hasSession: authInfo.hasSession,
    hasClerkAuth: authInfo.hasClerkAuth,
    pathname
  });

  // Check admin routes
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    console.log('🔍 STEP10 MIDDLEWARE: Admin route detected');

    if (!authInfo.hasSession) {
      console.log('🔍 STEP10 MIDDLEWARE: No auth session - redirecting to admin login');
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // For admin routes, we'll let the client-side check handle role verification
    // since we can't safely access Clerk's auth() function here
    console.log('🔍 STEP10 MIDDLEWARE: Auth session found - allowing admin route (role check on client)');
    return NextResponse.next();
  }

  // Check dashboard routes
  if (matchesRoute(pathname, DASHBOARD_ROUTES)) {
    console.log('🔍 STEP10 MIDDLEWARE: Dashboard route detected');

    if (!authInfo.hasSession) {
      console.log('🔍 STEP10 MIDDLEWARE: No auth session - redirecting to sign-in');
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    console.log('🔍 STEP10 MIDDLEWARE: Auth session found - allowing dashboard route');
    return NextResponse.next();
  }

  // Allow all other routes
  console.log('🔍 STEP10 MIDDLEWARE: Other route - allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
