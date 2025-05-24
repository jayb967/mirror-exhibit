import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';

// Create Clerk client instance
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * Debug endpoint to check current user's authentication and role information
 * This helps debug admin access issues
 */
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({
        error: 'Not authenticated',
        userId: null,
        sessionClaims: null
      });
    }

    // Extract role from all possible locations (same logic as middleware and API routes)
    const metadataRole = sessionClaims?.metadata?.role;
    const publicMetadataRole = sessionClaims?.publicMetadata?.role;
    const privateMetadataRole = sessionClaims?.privateMetadata?.role;

    let detectedRole = metadataRole || publicMetadataRole || privateMetadataRole;
    let roleSource = 'JWT';
    let clerkApiUser = null;

    // Fallback: Check Clerk API if role not in JWT (same as middleware)
    if (!detectedRole) {
      try {
        clerkApiUser = await clerkClient.users.getUser(userId);
        detectedRole = (clerkApiUser.publicMetadata?.role as string) ||
                      (clerkApiUser.privateMetadata?.role as string);
        roleSource = 'Clerk API';
      } catch (error) {
        console.error('Error fetching user role from Clerk API:', error);
        roleSource = 'Error fetching from Clerk API';
      }
    }

    return NextResponse.json({
      userId,
      detectedRole,
      roleSource,
      isAdmin: detectedRole === 'admin',
      debug: {
        sessionClaims: sessionClaims,
        metadataRole,
        publicMetadataRole,
        privateMetadataRole,
        clerkApiUser: clerkApiUser ? {
          publicMetadata: clerkApiUser.publicMetadata,
          privateMetadata: clerkApiUser.privateMetadata
        } : null,
        allMetadata: {
          metadata: sessionClaims?.metadata,
          publicMetadata: sessionClaims?.publicMetadata,
          privateMetadata: sessionClaims?.privateMetadata
        }
      }
    });
  } catch (error) {
    console.error('Error in auth debug endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
