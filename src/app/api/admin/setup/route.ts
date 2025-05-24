// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { setUserAsAdmin } from '@/utils/admin-setup';

/**
 * API route for setting up the first admin user
 * 
 * This route should be used carefully and only for initial setup.
 * Consider removing or securing it after setting up your admin users.
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in to use this endpoint' },
        { status: 401 }
      );
    }

    // Get the request body to check for setup key (optional security measure)
    const body = await req.json().catch(() => ({}));
    const { setupKey, targetUserId } = body;

    // Optional: Add a setup key for additional security
    // Uncomment and set your own setup key in environment variables
    // if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    //   return NextResponse.json(
    //     { error: 'Invalid setup key' },
    //     { status: 403 }
    //   );
    // }

    // Use targetUserId if provided, otherwise use the current user
    const userToPromote = targetUserId || userId;

    console.log(`Attempting to set user ${userToPromote} as admin`);
    
    const success = await setUserAsAdmin(userToPromote);
    
    if (success) {
      return NextResponse.json({ 
        message: 'Admin role set successfully',
        userId: userToPromote
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to set admin role' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in admin setup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check current user's admin status
 */
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'You must be signed in' },
        { status: 401 }
      );
    }

    const userRole = sessionClaims?.metadata?.role || 
                    sessionClaims?.publicMetadata?.role ||
                    sessionClaims?.privateMetadata?.role;

    return NextResponse.json({
      userId,
      role: userRole || 'customer',
      isAdmin: userRole === 'admin'
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Usage Instructions:
 * 
 * 1. Sign in to your Clerk account
 * 2. Make a POST request to /api/admin/setup
 * 3. This will set your current user as an admin
 * 
 * Example using curl:
 * curl -X POST http://localhost:3000/api/admin/setup \
 *   -H "Content-Type: application/json" \
 *   -d '{}'
 * 
 * Or with a setup key:
 * curl -X POST http://localhost:3000/api/admin/setup \
 *   -H "Content-Type: application/json" \
 *   -d '{"setupKey": "your-secret-key"}'
 * 
 * To promote a different user:
 * curl -X POST http://localhost:3000/api/admin/setup \
 *   -H "Content-Type: application/json" \
 *   -d '{"targetUserId": "user_xxxxx"}'
 */
