import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// STEP 3: Completely disable Clerk middleware to isolate the issue
export default function middleware(request: NextRequest) {
  console.log('🔍 STEP3 MIDDLEWARE DEBUG: Minimal middleware (no Clerk) for:', request.url);

  try {
    console.log('🔍 STEP3 MIDDLEWARE DEBUG: About to return NextResponse.next()');
    return NextResponse.next();
  } catch (error) {
    console.error('🔍 STEP3 MIDDLEWARE DEBUG: Error in minimal middleware:', error);
    console.error('🔍 STEP3 MIDDLEWARE DEBUG: Error message:', (error as any)?.message);

    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP3 MIDDLEWARE DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN MINIMAL MIDDLEWARE! ***');
    }

    return NextResponse.next();
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
