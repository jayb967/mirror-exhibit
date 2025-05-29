import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// STEP 6A: MINIMAL MIDDLEWARE TO ISOLATE CLERK ISSUE
const minimalClerkMiddleware = clerkMiddleware(async (auth, req) => {
  console.log('🔍 STEP6A MIDDLEWARE DEBUG: Starting MINIMAL middleware for:', req.url);
  console.log('🔍 STEP6A MIDDLEWARE DEBUG: Request method:', req.method);

  try {
    console.log('🔍 STEP6A MIDDLEWARE DEBUG: About to call auth() - MINIMAL VERSION');

    // MINIMAL auth() call with maximum error catching
    let authResult;
    try {
      authResult = await auth();
      console.log('🔍 STEP6A MIDDLEWARE DEBUG: auth() call successful - MINIMAL');
      console.log('🔍 STEP6A MIDDLEWARE DEBUG: userId present:', !!authResult?.userId);
    } catch (authError) {
      console.error('🔍 STEP6A MIDDLEWARE DEBUG: *** AUTH() CALL FAILED - THIS IS THE ISSUE! ***');
      console.error('🔍 STEP6A MIDDLEWARE DEBUG: Auth error:', authError);
      console.error('🔍 STEP6A MIDDLEWARE DEBUG: Auth error message:', (authError as any)?.message);
      console.error('🔍 STEP6A MIDDLEWARE DEBUG: Auth error name:', (authError as any)?.name);
      console.error('🔍 STEP6A MIDDLEWARE DEBUG: Auth error stack:', (authError as any)?.stack);

      // Check for constructor errors
      if ((authError as any)?.message?.includes('constructor') ||
          (authError as any)?.message?.includes('Ba') ||
          (authError as any)?.message?.includes('ja')) {
        console.error('🔍 STEP6A MIDDLEWARE DEBUG: *** FOUND CONSTRUCTOR ERROR IN AUTH()! ***');
        console.error('🔍 STEP6A MIDDLEWARE DEBUG: *** THIS IS THE ROOT CAUSE! ***');
      }

      // Return error response instead of continuing
      return new NextResponse('Middleware Auth Error', { status: 500 });
    }

    console.log('🔍 STEP6A MIDDLEWARE DEBUG: Minimal middleware completed successfully');
    return NextResponse.next();

  } catch (error) {
    console.error('🔍 STEP6A MIDDLEWARE DEBUG: *** FATAL MIDDLEWARE ERROR! ***');
    console.error('🔍 STEP6A MIDDLEWARE DEBUG: Fatal error:', error);
    console.error('🔍 STEP6A MIDDLEWARE DEBUG: Fatal error message:', (error as any)?.message);
    console.error('🔍 STEP6A MIDDLEWARE DEBUG: Fatal error stack:', (error as any)?.stack);

    // Check for constructor errors
    if ((error as any)?.message?.includes('constructor') ||
        (error as any)?.message?.includes('Ba') ||
        (error as any)?.message?.includes('ja')) {
      console.error('🔍 STEP6A MIDDLEWARE DEBUG: *** FOUND CONSTRUCTOR ERROR IN MIDDLEWARE! ***');
      console.error('🔍 STEP6A MIDDLEWARE DEBUG: *** THIS IS THE ROOT CAUSE! ***');
    }

    return new NextResponse('Middleware Fatal Error', { status: 500 });
  }
});

// STEP 6B: COMPLETELY BYPASS CLERK MIDDLEWARE FOR TESTING
function bypassMiddleware(req: NextRequest) {
  console.log('🔍 STEP6B BYPASS DEBUG: Completely bypassing Clerk middleware for:', req.url);
  console.log('🔍 STEP6B BYPASS DEBUG: Request method:', req.method);
  console.log('🔍 STEP6B BYPASS DEBUG: No auth processing - just passing through');
  return NextResponse.next();
}

// TOGGLE BETWEEN MINIMAL CLERK AND COMPLETE BYPASS
// Set to true to use minimal Clerk middleware, false to completely bypass Clerk
const USE_CLERK_MIDDLEWARE = false;

export default function middleware(req: NextRequest) {
  console.log('🔍 STEP6 MIDDLEWARE DEBUG: Middleware entry point');
  console.log('🔍 STEP6 MIDDLEWARE DEBUG: USE_CLERK_MIDDLEWARE:', USE_CLERK_MIDDLEWARE);

  if (USE_CLERK_MIDDLEWARE) {
    console.log('🔍 STEP6 MIDDLEWARE DEBUG: Using minimal Clerk middleware');
    return minimalClerkMiddleware(req);
  } else {
    console.log('🔍 STEP6 MIDDLEWARE DEBUG: Completely bypassing Clerk middleware');
    return bypassMiddleware(req);
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
