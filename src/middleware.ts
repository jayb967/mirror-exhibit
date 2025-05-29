import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// MINIMAL DEBUGGING MIDDLEWARE - To isolate the constructor error
export default clerkMiddleware(async (auth, req) => {
  console.log('🔍 MIDDLEWARE DEBUG: Starting middleware for:', req.url);

  try {
    // Step 1: Test if the basic middleware wrapper works
    console.log('🔍 MIDDLEWARE DEBUG: Step 1 - Basic middleware wrapper OK');

    // Step 2: Test if we can call auth() without errors
    console.log('🔍 MIDDLEWARE DEBUG: Step 2 - About to call auth()');

    let authResult;
    try {
      authResult = await auth();
      console.log('🔍 MIDDLEWARE DEBUG: Step 2 - auth() call successful');
      console.log('🔍 MIDDLEWARE DEBUG: Auth result keys:', Object.keys(authResult || {}));
    } catch (authError) {
      console.error('🔍 MIDDLEWARE DEBUG: Step 2 - auth() call FAILED:', authError);
      console.error('🔍 MIDDLEWARE DEBUG: Auth error name:', (authError as any)?.name);
      console.error('🔍 MIDDLEWARE DEBUG: Auth error message:', (authError as any)?.message);
      // Return early if auth() fails
      return NextResponse.next();
    }

    // Step 3: Test if we can access basic auth properties
    console.log('🔍 MIDDLEWARE DEBUG: Step 3 - Accessing auth properties');
    const userId = authResult?.userId;
    console.log('🔍 MIDDLEWARE DEBUG: Step 3 - userId:', userId ? 'present' : 'null');

    // Step 4: Test if we can access session claims
    console.log('🔍 MIDDLEWARE DEBUG: Step 4 - Accessing session claims');
    const sessionClaims = authResult?.sessionClaims;
    console.log('🔍 MIDDLEWARE DEBUG: Step 4 - sessionClaims:', sessionClaims ? 'present' : 'null');

    console.log('🔍 MIDDLEWARE DEBUG: All steps completed successfully');
    return NextResponse.next();

  } catch (error) {
    console.error('🔍 MIDDLEWARE DEBUG: FATAL ERROR in middleware:', error);
    console.error('🔍 MIDDLEWARE DEBUG: Error name:', (error as any)?.name);
    console.error('🔍 MIDDLEWARE DEBUG: Error message:', (error as any)?.message);
    console.error('🔍 MIDDLEWARE DEBUG: Error stack:', (error as any)?.stack);

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('$a')) {
      console.error('🔍 MIDDLEWARE DEBUG: *** FOUND THE CONSTRUCTOR ERROR! ***');
      console.error('🔍 MIDDLEWARE DEBUG: This is the $a constructor error we are hunting');
    }

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
