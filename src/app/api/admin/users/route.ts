// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';

// Create Clerk client instance
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

/**
 * GET /api/admin/users
 * Fetch all users from Clerk for admin management
 */
export async function GET(request: NextRequest) {
  try {
    // NOTE: This endpoint is protected by middleware (/admin routes require authentication)
    // Using Clerk client directly since this is an admin-only endpoint
    console.log('Admin users API: Processing request for admin users');

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const showInactive = searchParams.get('showInactive') === 'true';

    console.log('API: /api/admin/users - Fetching users with filters:', {
      search,
      limit,
      offset,
      showInactive
    });

    // Fetch users from Clerk
    const usersResponse = await clerkClient.users.getUserList({
      limit,
      offset,
      query: search || undefined,
    });

    // Transform Clerk users to our expected format
    const transformedUsers = usersResponse.data.map(user => {
      const role = (user.publicMetadata?.role as string) ||
                   (user.privateMetadata?.role as string) ||
                   'customer';

      // Determine user status based on various factors
      const isActive = !user.banned &&
                      !user.locked &&
                      user.emailAddresses.some(email => email.verification?.status === 'verified');

      return {
        id: user.id,
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.emailAddresses[0]?.emailAddress || 'No email',
        role: role,
        status: isActive ? 'active' : 'inactive',
        lastLogin: user.lastSignInAt || user.createdAt || '',
        avatar: user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.firstName || 'U')}&background=A6A182&color=fff`,
        createdAt: user.createdAt || '',
        emailVerified: user.emailAddresses[0]?.verification?.status === 'verified',
        banned: user.banned,
        locked: user.locked,
        twoFactorEnabled: user.twoFactorEnabled,
      };
    });

    // Filter by status if needed
    const filteredUsers = showInactive
      ? transformedUsers
      : transformedUsers.filter(user => user.status === 'active');

    return NextResponse.json({
      users: filteredUsers,
      totalCount: usersResponse.totalCount,
      hasMore: (offset + limit) < usersResponse.totalCount
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users
 * Update user role or status
 */
export async function PUT(request: NextRequest) {
  try {
    // NOTE: This endpoint is protected by middleware (/admin routes require authentication)
    // Using Clerk client directly since this is an admin-only endpoint
    console.log('Admin users API: Processing user update');

    const body = await request.json();
    const { userId, action, role } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    console.log('API: /api/admin/users - Updating user:', { userId, action, role });

    switch (action) {
      case 'updateRole':
        if (!role || !['admin', 'customer'].includes(role)) {
          return NextResponse.json(
            { error: 'Valid role is required (admin or customer)' },
            { status: 400 }
          );
        }

        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: { role }
        });
        break;

      case 'ban':
        await clerkClient.users.banUser(userId);
        break;

      case 'unban':
        await clerkClient.users.unbanUser(userId);
        break;

      case 'lock':
        await clerkClient.users.lockUser(userId);
        break;

      case 'unlock':
        await clerkClient.users.unlockUser(userId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
