/**
 * Admin Setup Utilities for Clerk
 * 
 * This file contains utilities for setting up admin users in Clerk.
 * These functions should be used carefully and only by authorized personnel.
 */

import { clerkClient } from '@clerk/nextjs/server';

/**
 * Set a user's role to admin
 * This function should only be called from server-side code or API routes
 * 
 * @param userId - The Clerk user ID
 * @returns Promise<boolean> - Success status
 */
export async function setUserAsAdmin(userId: string): Promise<boolean> {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'admin'
      }
    });
    
    console.log(`Successfully set user ${userId} as admin`);
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
  }
}

/**
 * Remove admin role from a user
 * 
 * @param userId - The Clerk user ID
 * @returns Promise<boolean> - Success status
 */
export async function removeAdminRole(userId: string): Promise<boolean> {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'customer'
      }
    });
    
    console.log(`Successfully removed admin role from user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error removing admin role:', error);
    return false;
  }
}

/**
 * Check if a user is an admin
 * 
 * @param userId - The Clerk user ID
 * @returns Promise<boolean> - Whether the user is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role || user.privateMetadata?.role;
    return role === 'admin';
  } catch (error) {
    console.error('Error checking user admin status:', error);
    return false;
  }
}

/**
 * Get all admin users
 * 
 * @returns Promise<Array> - List of admin users
 */
export async function getAllAdminUsers() {
  try {
    // Note: Clerk doesn't have a direct way to query by metadata
    // This is a simplified approach - in production, you might want to maintain
    // a separate admin users list or use Clerk's organization features
    const users = await clerkClient.users.getUserList({
      limit: 100, // Adjust as needed
    });
    
    return users.filter(user => {
      const role = user.publicMetadata?.role || user.privateMetadata?.role;
      return role === 'admin';
    });
  } catch (error) {
    console.error('Error getting admin users:', error);
    return [];
  }
}

/**
 * Instructions for setting up the first admin user:
 * 
 * 1. Create an API route (e.g., /api/admin/setup) that calls setUserAsAdmin()
 * 2. Protect this route with appropriate authentication
 * 3. Use it to set up your first admin user
 * 4. Remove or secure the setup route after initial setup
 * 
 * Example API route:
 * 
 * ```typescript
 * // pages/api/admin/setup.ts or app/api/admin/setup/route.ts
 * import { setUserAsAdmin } from '@/utils/admin-setup';
 * import { auth } from '@clerk/nextjs/server';
 * 
 * export async function POST(req: Request) {
 *   const { userId } = await auth();
 *   
 *   // Add your own authorization logic here
 *   // For example, check if this is the first user or use a secret key
 *   
 *   if (!userId) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   
 *   const success = await setUserAsAdmin(userId);
 *   
 *   if (success) {
 *     return Response.json({ message: 'Admin role set successfully' });
 *   } else {
 *     return Response.json({ error: 'Failed to set admin role' }, { status: 500 });
 *   }
 * }
 * ```
 */
