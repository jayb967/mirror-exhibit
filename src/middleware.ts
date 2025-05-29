import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// STEP 2: Back to Clerk middleware with debugging
export default clerkMiddleware(async (auth, req) => {
  console.log('🔍 STEP2 MIDDLEWARE DEBUG: Starting middleware for:', req.url);

  try {
    // Step 1: Test if the basic middleware wrapper works
    console.log('🔍 STEP2 MIDDLEWARE DEBUG: Step 1 - Basic middleware wrapper OK');

    // Step 2: Test if we can call auth() without errors
    console.log('🔍 STEP2 MIDDLEWARE DEBUG: Step 2 - About to call auth()');

    let authResult;
    try {
      authResult = await auth();
      console.log('🔍 STEP2 MIDDLEWARE DEBUG: Step 2 - auth() call successful');
      console.log('🔍 STEP2 MIDDLEWARE DEBUG: Auth result keys:', Object.keys(authResult || {}));
    } catch (authError) {
      console.error('🔍 STEP2 MIDDLEWARE DEBUG: Step 2 - auth() call FAILED:', authError);
      console.error('🔍 STEP2 MIDDLEWARE DEBUG: Auth error name:', (authError as any)?.name);
      console.error('🔍 STEP2 MIDDLEWARE DEBUG: Auth error message:', (authError as any)?.message);

      // Check if this is the constructor error we're looking for
      if ((authError as any)?.message?.includes('constructor') || (authError as any)?.message?.includes('Ba')) {
        console.error('🔍 STEP2 MIDDLEWARE DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN AUTH()! ***');
      }

      // Return early if auth() fails
      return NextResponse.next();
    }

    // Step 3: Test if we can access basic auth properties
    console.log('🔍 STEP2 MIDDLEWARE DEBUG: Step 3 - Accessing auth properties');
    const userId = authResult?.userId;
    console.log('🔍 STEP2 MIDDLEWARE DEBUG: Step 3 - userId:', userId ? 'present' : 'null');

    // Step 4: Test if we can access session claims
    console.log('🔍 STEP2 MIDDLEWARE DEBUG: Step 4 - Accessing session claims');
    const sessionClaims = authResult?.sessionClaims;
    console.log('🔍 STEP2 MIDDLEWARE DEBUG: Step 4 - sessionClaims:', sessionClaims ? 'present' : 'null');

    console.log('🔍 STEP2 MIDDLEWARE DEBUG: All steps completed successfully');
    return NextResponse.next();

  } catch (error) {
    console.error('🔍 STEP2 MIDDLEWARE DEBUG: FATAL ERROR in middleware:', error);
    console.error('🔍 STEP2 MIDDLEWARE DEBUG: Error name:', (error as any)?.name);
    console.error('🔍 STEP2 MIDDLEWARE DEBUG: Error message:', (error as any)?.message);
    console.error('🔍 STEP2 MIDDLEWARE DEBUG: Error stack:', (error as any)?.stack);

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP2 MIDDLEWARE DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR! ***');
      console.error('🔍 STEP2 MIDDLEWARE DEBUG: This is the Ba constructor error we are hunting');
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
