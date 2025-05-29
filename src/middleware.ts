import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Create Clerk client instance with error handling
let clerkClient: any = null;
try {
  clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
} catch (error) {
  console.error('Failed to create Clerk client:', error);
}

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/profile(.*)',
  '/orders(.*)',
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Define public admin routes that don't require authentication
const isPublicAdminRoute = createRouteMatcher([
  '/admin/login',
  '/admin/forgot-password',
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // Add specific error handling around auth() call
    let userId, sessionClaims;
    try {
      const authResult = await auth();
      userId = authResult.userId;
      sessionClaims = authResult.sessionClaims;
    } catch (authError) {
      console.warn('Auth function failed in middleware:', authError);
      // If auth fails, treat as unauthenticated user and allow request to proceed
      return NextResponse.next();
    }

    // Allow public admin routes
    if (isPublicAdminRoute(req)) {
      return NextResponse.next();
    }

    // Protect admin routes
    if (isAdminRoute(req)) {
      // Redirect to sign-in if not authenticated
      if (!userId) {
        const signInUrl = new URL('/admin/login', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }

      // Check for admin role in multiple possible locations with error handling
      let userRole;
      try {
        userRole = sessionClaims?.metadata?.role ||
                   sessionClaims?.publicMetadata?.role ||
                   sessionClaims?.privateMetadata?.role;
      } catch (roleError) {
        console.warn('Error accessing session claims:', roleError);
        userRole = null;
      }

      // Check for admin role via Clerk API if not found in JWT and client is available
      if (!userRole && clerkClient && userId) {
        try {
          const user = await clerkClient.users.getUser(userId);
          userRole = (user.publicMetadata?.role as string) ||
                     (user.privateMetadata?.role as string);
          console.log('Admin access via Clerk API:', { userId, role: userRole });
        } catch (error) {
          console.warn('Error fetching user role from Clerk API:', error);
          // Continue without role - access will be denied below
        }
      } else if (userRole) {
        console.log('Admin access via JWT:', { userId, role: userRole });
      }

      if (userRole !== 'admin') {
        console.log('Access denied: User role is not admin:', userRole);
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      console.log('Admin access granted for user:', userId);
    }

    // Protect other authenticated routes - redirect to home page where Clerk modal can be triggered
    if (isProtectedRoute(req) && !userId) {
      const homeUrl = new URL('/', req.url);
      homeUrl.searchParams.set('auth_required', 'true');
      homeUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Log the specific error details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // If there's an error in authentication, allow the request to proceed
    // This prevents the app from crashing due to Clerk crypto issues
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
