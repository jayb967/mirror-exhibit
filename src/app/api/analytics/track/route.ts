// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Types for analytics events (matching the frontend types)
interface AnalyticsEvent {
  event_type: 'view' | 'add_to_cart_click' | 'option_select' | 'modal_open' | 'modal_close' | 'carousel_interaction' | 'product_click';
  product_id?: string;
  event_data: Record<string, any>;
  source?: string;
  session_id?: string;
  user_id?: string;
}

interface TrackingRequest {
  events: AnalyticsEvent[];
}

export async function POST(request: NextRequest) {
  try {
    // Use service role client for analytics to bypass RLS policies
    const supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Also create regular client to get user info if available
    const supabase = await createServerSupabaseClient();

    // Parse request body
    const body: TrackingRequest = await request.json();

    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: 'Events array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate events array size (prevent abuse)
    if (body.events.length > 50) {
      return NextResponse.json(
        { error: 'Too many events in batch. Maximum 50 events allowed.' },
        { status: 400 }
      );
    }

    // Get user information if authenticated (but don't fail if not)
    let user = null;
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (authError) {
      // Continue without user info for anonymous tracking
      console.log('No authenticated user for analytics tracking');
    }

    // Get client information
    const clientIP = request.ip ||
                    request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || '';

    // Prepare analytics records for batch insert
    const analyticsRecords = body.events.map(event => {
      // Validate required fields based on event type
      if (event.event_type !== 'carousel_interaction' && !event.product_id) {
        throw new Error(`Product ID is required for event type: ${event.event_type}`);
      }

      // Validate event type
      const validEventTypes = [
        'view',
        'add_to_cart_click',
        'option_select',
        'modal_open',
        'modal_close',
        'carousel_interaction',
        'product_click'
      ];

      if (!validEventTypes.includes(event.event_type)) {
        throw new Error(`Invalid event type: ${event.event_type}`);
      }

      return {
        product_id: event.product_id || null,
        user_id: user?.id || null,
        session_id: event.session_id || null,
        event_type: event.event_type,
        event_data: event.event_data || {},
        ip_address: clientIP,
        user_agent: userAgent,
        referrer: referrer,
        source: event.source || 'unknown',
      };
    });

    // Insert analytics records in batch using service role client
    const { data, error } = await supabaseServiceRole
      .from('product_analytics')
      .insert(analyticsRecords)
      .select('id');

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save analytics data', details: error.message },
        { status: 500 }
      );
    }

    // Log successful tracking (for debugging)
    console.log(`Analytics: Tracked ${body.events.length} events for ${user?.id || 'anonymous'} user`);

    // Return success response
    return NextResponse.json({
      success: true,
      tracked_events: data?.length || 0,
      message: 'Analytics events tracked successfully'
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET endpoint for analytics health check
export async function GET() {
  try {
    // Use service role client for health check to bypass RLS policies
    const supabaseServiceRole = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Simple health check - count recent analytics events
    const { count, error } = await supabaseServiceRole
      .from('product_analytics')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

    if (error) {
      return NextResponse.json(
        { error: 'Health check failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      events_last_24h: count || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics health check error:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}
