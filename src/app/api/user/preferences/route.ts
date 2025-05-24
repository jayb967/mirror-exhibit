// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { notificationService } from '@/services/notificationService';

/**
 * GET /api/user/preferences
 * Get notification preferences for the authenticated user
 */
export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await notificationService.getUserPreferences(userId);

    if (!preferences) {
      // Create default preferences if they don't exist
      const createResult = await notificationService.createDefaultPreferences(userId);
      if (createResult.success) {
        const newPreferences = await notificationService.getUserPreferences(userId);
        return NextResponse.json({ preferences: newPreferences });
      } else {
        return NextResponse.json(
          { error: 'Failed to create default preferences' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ preferences });
  } catch (error: any) {
    console.error('Get user preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * Update notification preferences for the authenticated user
 */
export async function PUT(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      email_order_updates,
      email_shipping_updates,
      email_promotional,
      email_system_updates,
      in_app_order_updates,
      in_app_shipping_updates,
      in_app_promotional,
      in_app_system_updates,
      unsubscribed_all
    } = body;

    // Validate the input
    const booleanFields = [
      'email_order_updates',
      'email_shipping_updates',
      'email_promotional',
      'email_system_updates',
      'in_app_order_updates',
      'in_app_shipping_updates',
      'in_app_promotional',
      'in_app_system_updates',
      'unsubscribed_all'
    ];

    for (const field of booleanFields) {
      if (body[field] !== undefined && typeof body[field] !== 'boolean') {
        return NextResponse.json(
          { error: `${field} must be a boolean` },
          { status: 400 }
        );
      }
    }

    const result = await notificationService.updateUserPreferences(userId, {
      email_order_updates,
      email_shipping_updates,
      email_promotional,
      email_system_updates,
      in_app_order_updates,
      in_app_shipping_updates,
      in_app_promotional,
      in_app_system_updates,
      unsubscribed_all
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Get updated preferences to return
    const updatedPreferences = await notificationService.getUserPreferences(userId);

    return NextResponse.json({
      success: true,
      preferences: updatedPreferences
    });
  } catch (error: any) {
    console.error('Update user preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
