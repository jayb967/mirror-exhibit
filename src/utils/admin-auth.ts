import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Create Clerk client instance
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export interface AdminAuthResult {
  success: boolean;
  userId?: string;
  userRole?: string;
  error?: NextResponse;
}

/**
 * SAFE admin verification that doesn't use problematic auth() function
 * This version extracts the session token from headers and verifies directly with Clerk
 * Avoids the production issues with clerkMiddleware() requirement
 */
export async function verifyAdminAccessSafe(request: NextRequest, options: {
  operation?: string;
  requireRole?: string;
} = {}): Promise<AdminAuthResult> {
  const { operation = 'admin operation', requireRole = 'admin' } = options;

  try {
    // Extract session token from Authorization header or cookies
    let sessionToken: string | undefined;

    // Try Authorization header first
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7);
    }

    // Fallback to cookies
    if (!sessionToken) {
      sessionToken = request.cookies.get('__clerk_session')?.value;
    }

    if (!sessionToken) {
      console.log(`Access denied: No session token found for ${operation}`);
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        )
      };
    }

    // Get session from Clerk client
    let session;
    try {
      session = await clerkClient.sessions.getSession(sessionToken);
    } catch (error) {
      console.log(`Access denied: Invalid session token for ${operation}:`, error);
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Unauthorized - Invalid session' },
          { status: 401 }
        )
      };
    }

    if (!session || !session.userId || session.status !== 'active') {
      console.log(`Access denied: Session verification failed for ${operation}`, {
        hasSession: !!session,
        userId: session?.userId,
        status: session?.status
      });
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Unauthorized - Session verification failed' },
          { status: 401 }
        )
      };
    }

    const userId = session.userId;

    // Get user and check role
    let user;
    try {
      user = await clerkClient.users.getUser(userId);
    } catch (error) {
      console.error(`Error fetching user for ${operation}:`, error);
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Unable to verify user access' },
          { status: 500 }
        )
      };
    }

    const userRole = (user.publicMetadata?.role as string) ||
                     (user.privateMetadata?.role as string);

    // Check if user has required role
    if (userRole !== requireRole) {
      console.log(`Access denied: User role '${userRole}' is not '${requireRole}' for ${operation}:`, userId);
      return {
        success: false,
        error: NextResponse.json(
          { error: `Forbidden - ${requireRole} access required` },
          { status: 403 }
        )
      };
    }

    console.log(`Admin access granted for ${operation}:`, { userId, role: userRole, source: 'Safe verification' });

    return {
      success: true,
      userId,
      userRole
    };

  } catch (error) {
    console.error(`Error in safe admin auth verification for ${operation}:`, error);
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      )
    };
  }
}

/**
 * LEGACY admin verification that uses problematic auth() function
 * This function may cause "clerkMiddleware() not detected" errors in production
 * Use verifyAdminAccessSafe() instead for production environments
 *
 * @deprecated Use verifyAdminAccessSafe() instead
 * @param options Configuration options
 * @returns AdminAuthResult with success status and error response if needed
 */
export async function verifyAdminAccess(options: {
  operation?: string; // Optional operation name for logging (e.g., 'create product', 'update order')
  requireRole?: string; // Optional specific role requirement (defaults to 'admin')
} = {}): Promise<AdminAuthResult> {
  const { operation = 'admin operation', requireRole = 'admin' } = options;

  try {
    // Check authentication with Clerk
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      console.log(`Access denied: Not authenticated for ${operation}`);
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        )
      };
    }

    // Check for admin role in multiple possible locations (same as middleware)
    let userRole = sessionClaims?.metadata?.role ||
                   sessionClaims?.publicMetadata?.role ||
                   sessionClaims?.privateMetadata?.role;

    let roleSource = 'JWT';

    // Fallback: Check Clerk API if role not in JWT
    if (!userRole) {
      try {
        const user = await clerkClient.users.getUser(userId);
        userRole = (user.publicMetadata?.role as string) ||
                   (user.privateMetadata?.role as string);
        roleSource = 'Clerk API';
        console.log(`Admin access via Clerk API for ${operation}:`, { userId, role: userRole });
      } catch (error) {
        console.error(`Error fetching user role from Clerk for ${operation}:`, error);
        return {
          success: false,
          error: NextResponse.json(
            { error: 'Unable to verify admin access' },
            { status: 500 }
          )
        };
      }
    } else {
      console.log(`Admin access via JWT for ${operation}:`, { userId, role: userRole });
    }

    // Check if user has required role
    if (userRole !== requireRole) {
      console.log(`Access denied: User role '${userRole}' is not '${requireRole}' for ${operation}:`, userId);
      return {
        success: false,
        error: NextResponse.json(
          { error: `Forbidden - ${requireRole} access required` },
          { status: 403 }
        )
      };
    }

    console.log(`Admin access granted for ${operation}:`, { userId, role: userRole, source: roleSource });

    return {
      success: true,
      userId,
      userRole
    };

  } catch (error) {
    console.error(`Error in admin auth verification for ${operation}:`, error);
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Internal server error during authentication' },
        { status: 500 }
      )
    };
  }
}

/**
 * Simplified admin check that just returns boolean
 * Useful for middleware or client-side checks
 *
 * @param userId Optional userId if already available
 * @returns Promise<boolean> indicating if user is admin
 */
export async function isUserAdmin(userId?: string): Promise<boolean> {
  try {
    let currentUserId = userId;

    if (!currentUserId) {
      const { userId: authUserId } = await auth();
      if (!authUserId) return false;
      currentUserId = authUserId;
    }

    const user = await clerkClient.users.getUser(currentUserId);
    const userRole = (user.publicMetadata?.role as string) ||
                     (user.privateMetadata?.role as string);

    return userRole === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get user role from Clerk
 *
 * @param userId Optional userId if already available
 * @returns Promise<string | null> user role or null if not found
 */
export async function getUserRole(userId?: string): Promise<string | null> {
  try {
    let currentUserId = userId;

    if (!currentUserId) {
      const { userId: authUserId } = await auth();
      if (!authUserId) return null;
      currentUserId = authUserId;
    }

    const user = await clerkClient.users.getUser(currentUserId);
    return (user.publicMetadata?.role as string) ||
           (user.privateMetadata?.role as string) ||
           null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}
