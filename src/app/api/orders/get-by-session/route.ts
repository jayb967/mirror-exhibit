import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, userId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Create a Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // First, check if there's a pending order (webhook might not have processed yet)
    const { data: pendingOrder } = await supabase
      .from('pending_orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (pendingOrder) {
      // Order is still pending - webhook hasn't processed yet
      return NextResponse.json({ 
        status: 'pending',
        message: 'Payment successful, order is being processed...',
        sessionId 
      });
    }

    // Look for completed order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('stripe_session_id', sessionId)
      .single();

    if (orderError || !order) {
      console.error('Order not found for session:', sessionId, orderError);
      return NextResponse.json({ 
        error: 'Order not found',
        sessionId,
        details: orderError?.message 
      }, { status: 404 });
    }

    // Validate order belongs to user (if authenticated)
    if (userId && order.user_id && order.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ 
      order,
      status: 'completed',
      message: 'Order found successfully'
    });

  } catch (error) {
    console.error('Error fetching order by session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
