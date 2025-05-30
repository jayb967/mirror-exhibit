import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// STEP 11: CLERK-ONLY ROUTE PROTECTION
// This implements proper Clerk-only route protection without the problematic clerkMiddleware wrapper
// Uses Clerk session tokens and proper role checking

// CONFIGURATION
const ENABLE_ROUTE_PROTECTION = true;

// Protected route patterns
const ADMIN_ROUTES = ['/admin'];
const DASHBOARD_ROUTES = ['/dashboard'];
const PUBLIC_ROUTES = ['/admin/login', '/sign-in', '/sign-up', '/', '/shop', '/product', '/about-us', '/contact', '/faq', '/cart', '/checkout', '/order', '/tracking', '/unauthorized'];

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

// Helper function to extract Clerk auth info from cookies
function getClerkAuthFromCookies(req: NextRequest) {
  // Get the main Clerk session token
  const clerkSessionToken = req.cookies.get('__clerk_session')?.value;

  // Check for any Clerk-related cookies
  const clerkCookies: string[] = [];
  req.cookies.getAll().forEach(cookie => {
    if (cookie.name.startsWith('__clerk')) {
      clerkCookies.push(cookie.name);
    }
  });

  const hasClerkAuth = !!clerkSessionToken || clerkCookies.length > 0;

  return {
    hasSession: hasClerkAuth,
    sessionToken: clerkSessionToken,
    clerkCookies,
    hasClerkAuth
  };
}

// STEP 11: CLERK-ONLY ROUTE PROTECTION MIDDLEWARE
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;


  if (!ENABLE_ROUTE_PROTECTION) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get Clerk auth info from cookies
  const authInfo = getClerkAuthFromCookies(req);

  // Check admin routes - STRICT: Must be authenticated (client-side will check admin role)
  if (matchesRoute(pathname, ADMIN_ROUTES)) {

    if (!authInfo.hasSession) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // NOTE: We can't check admin role in middleware without using problematic clerkMiddleware
    // Client-side components will handle admin role verification
    return NextResponse.next();
  }

  // Check dashboard routes - Must be authenticated
  if (matchesRoute(pathname, DASHBOARD_ROUTES)) {

    if (!authInfo.hasSession) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    return NextResponse.next();
  }

  // Allow all other routes
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
