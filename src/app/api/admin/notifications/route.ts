import { NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/utils/admin-auth';
import { notificationService } from '@/services/notificationService';

/**
 * GET /api/admin/notifications
 * Get admin notifications
 */
export async function GET(req: Request) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess({
      operation: 'fetch admin notifications'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unread_only') === 'true';

    const result = await notificationService.getAdminNotifications({
      limit,
      offset,
      unreadOnly
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get admin notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Create admin notification
 */
export async function POST(req: Request) {
  try {
    // Verify admin access
    const authResult = await verifyAdminAccess({
      operation: 'create admin notification'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const body = await req.json();
    const {
      type,
      title,
      message,
      actionUrl,
      data,
      expiresAt
    } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, message' },
        { status: 400 }
      );
    }

    const result = await notificationService.createNotification({
      type,
      title,
      message,
      actionUrl,
      data,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    }, {
      adminOnly: true
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notificationId: result.notificationId
    });
  } catch (error: any) {
    console.error('Create admin notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin notification' },
      { status: 500 }
    );
  }
}
