import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// STEP 4: ULTRA-AGGRESSIVE MIDDLEWARE DEBUGGING
export default clerkMiddleware(async (auth, req) => {
  console.log('🔍 STEP4 MIDDLEWARE DEBUG: Starting middleware for:', req.url);
  console.log('🔍 STEP4 MIDDLEWARE DEBUG: Request method:', req.method);
  console.log('🔍 STEP4 MIDDLEWARE DEBUG: Request headers:', Object.fromEntries(req.headers.entries()));

  try {
    // Step 1: Test if the basic middleware wrapper works
    console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 1 - Basic middleware wrapper OK');

    // Step 2: Test if we can call auth() without errors
    console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 2 - About to call auth()');
    console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 2 - auth function type:', typeof auth);

    let authResult;
    try {
      console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 2 - Calling auth() now...');
      authResult = await auth();
      console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 2 - auth() call successful');
      console.log('🔍 STEP4 MIDDLEWARE DEBUG: Auth result type:', typeof authResult);
      console.log('🔍 STEP4 MIDDLEWARE DEBUG: Auth result keys:', Object.keys(authResult || {}));
      console.log('🔍 STEP4 MIDDLEWARE DEBUG: Auth result:', authResult);
    } catch (authError) {
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: Step 2 - auth() call FAILED:', authError);
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: Auth error name:', (authError as any)?.name);
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: Auth error message:', (authError as any)?.message);
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: Auth error stack:', (authError as any)?.stack);
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: Auth error constructor:', (authError as any)?.constructor?.name);

      // Check if this is the constructor error we're looking for
      if ((authError as any)?.message?.includes('constructor') || (authError as any)?.message?.includes('Ba')) {
        console.error('🔍 STEP4 MIDDLEWARE DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN AUTH()! ***');
        console.error('🔍 STEP4 MIDDLEWARE DEBUG: *** THIS IS THE SOURCE OF THE Ba ERROR! ***');
        console.error('🔍 STEP4 MIDDLEWARE DEBUG: *** ERROR DETAILS: ***', {
          name: (authError as any)?.name,
          message: (authError as any)?.message,
          stack: (authError as any)?.stack,
          constructor: (authError as any)?.constructor?.name
        });
      }

      // Return early if auth() fails
      return NextResponse.next();
    }

    // Step 3: Test if we can access basic auth properties
    console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 3 - Accessing auth properties');
    try {
      const userId = authResult?.userId;
      console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 3 - userId:', userId ? 'present' : 'null');
    } catch (userIdError) {
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: Step 3 - userId access FAILED:', userIdError);
      if ((userIdError as any)?.message?.includes('constructor') || (userIdError as any)?.message?.includes('Ba')) {
        console.error('🔍 STEP4 MIDDLEWARE DEBUG: *** FOUND Ba ERROR IN USERID ACCESS! ***');
      }
    }

    // Step 4: Test if we can access session claims
    console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 4 - Accessing session claims');
    try {
      const sessionClaims = authResult?.sessionClaims;
      console.log('🔍 STEP4 MIDDLEWARE DEBUG: Step 4 - sessionClaims:', sessionClaims ? 'present' : 'null');
    } catch (sessionError) {
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: Step 4 - sessionClaims access FAILED:', sessionError);
      if ((sessionError as any)?.message?.includes('constructor') || (sessionError as any)?.message?.includes('Ba')) {
        console.error('🔍 STEP4 MIDDLEWARE DEBUG: *** FOUND Ba ERROR IN SESSION ACCESS! ***');
      }
    }

    console.log('🔍 STEP4 MIDDLEWARE DEBUG: All steps completed successfully');
    return NextResponse.next();

  } catch (error) {
    console.error('🔍 STEP4 MIDDLEWARE DEBUG: FATAL ERROR in middleware:', error);
    console.error('🔍 STEP4 MIDDLEWARE DEBUG: Error name:', (error as any)?.name);
    console.error('🔍 STEP4 MIDDLEWARE DEBUG: Error message:', (error as any)?.message);
    console.error('🔍 STEP4 MIDDLEWARE DEBUG: Error stack:', (error as any)?.stack);
    console.error('🔍 STEP4 MIDDLEWARE DEBUG: Error constructor:', (error as any)?.constructor?.name);
    console.error('🔍 STEP4 MIDDLEWARE DEBUG: Error toString:', (error as any)?.toString?.());

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR! ***');
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: *** THIS IS THE SOURCE OF THE Ba ERROR! ***');
      console.error('🔍 STEP4 MIDDLEWARE DEBUG: *** FULL ERROR OBJECT: ***', error);
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
