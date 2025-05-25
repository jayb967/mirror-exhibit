// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { notificationService } from '@/services/notificationService';

/**
 * PATCH /api/notifications/[id]
 * Update notification (mark as read, archive, etc.)
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'mark_read':
        result = await notificationService.markAsRead(params.id, userId);
        break;

      case 'archive':
        result = await notificationService.archiveNotification(params.id, userId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}
