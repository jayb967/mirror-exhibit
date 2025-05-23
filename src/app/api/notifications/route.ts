import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { notificationService } from '@/services/notificationService';

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */
export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unread_only') === 'true';
    const includeArchived = url.searchParams.get('include_archived') === 'true';

    const result = await notificationService.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly,
      includeArchived
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin only)
 */
export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here
    // You'll need to implement admin role checking based on your Clerk setup

    const body = await req.json();
    const {
      type,
      title,
      message,
      actionUrl,
      data,
      expiresAt,
      targetUserId,
      adminOnly,
      sendEmail,
      emailTemplate,
      emailData,
      priority
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
      userId: targetUserId,
      adminOnly,
      sendEmail,
      emailTemplate,
      emailData,
      priority
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
    console.error('Create notification error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
