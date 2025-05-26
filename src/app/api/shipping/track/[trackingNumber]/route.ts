// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceRoleSupabaseClient } from '@/utils/clerk-supabase';
import { shippingService } from '@/services/shippingService';

/**
 * Track a shipment
 *
 * Path parameter:
 * - trackingNumber: Tracking number to look up
 *
 * Response:
 * {
 *   status: string;
 *   estimatedDeliveryDate?: string;
 *   events: {
 *     date: string;
 *     location: string;
 *     message: string;
 *     status: string;
 *   }[];
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const trackingNumber = params.trackingNumber;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServiceRoleSupabaseClient();

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();

    // Find order with this tracking number
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status')
      .eq('tracking_number', trackingNumber)
      .single();

    // If no order found or error, return 404
    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Tracking information not found' },
        { status: 404 }
      );
    }

    // If user is not authenticated or not the owner of the order and not an admin, return 403
    if (session) {
      const isAdmin = session.user.user_metadata?.role === 'admin';
      const isOwner = order.user_id === session.user.id;

      if (!isAdmin && !isOwner) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else {
      // For public tracking, we could allow it but with limited information
      // For now, we'll require authentication
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Track shipment
    const tracking = await shippingService.trackShipment(trackingNumber);

    return NextResponse.json(tracking);
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json(
      { error: 'Failed to track shipment' },
      { status: 500 }
    );
  }
}
