import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

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

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingOrder) {
      return NextResponse.json({
        message: 'Order already exists',
        orderId: existingOrder.id
      });
    }

    // Get pending order data
    const { data: pendingOrder, error: pendingError } = await supabase
      .from('pending_orders')
      .select('order_data, items_data')
      .eq('stripe_session_id', sessionId)
      .single();

    if (pendingError || !pendingOrder) {
      return NextResponse.json({
        error: 'No pending order found for this session'
      }, { status: 404 });
    }

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        error: 'Payment not completed'
      }, { status: 400 });
    }

    // Create order from pending data
    const orderData = pendingOrder.order_data;
    const items = pendingOrder.items_data;

    const finalOrderData = {
      ...orderData,
      status: 'paid',
      stripe_session_id: sessionId,
      stripe_payment_intent_id: session.payment_intent,
      payment_status: 'completed',
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(finalOrderData)
      .select('*')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item: any) => {
      const unitPrice = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      const totalPrice = unitPrice * quantity;

      return {
        order_id: order.id,
        product_id: item.product_id || item.id,
        quantity: quantity,
        price: unitPrice,
        unit_price: unitPrice, // Some schemas use unit_price instead of price
        total_price: totalPrice, // unit_price * quantity
        product_name: item.name,
        variation_id: item.variation_id || null,
        size_name: item.size_name || null,
        frame_name: item.frame_name || null
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Clean up the order if items creation failed
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    // Clean up pending order
    await supabase
      .from('pending_orders')
      .delete()
      .eq('stripe_session_id', sessionId);

    // If coupon was applied, increment its usage count
    if (orderData.coupon_id) {
      try {
        const { data: couponResult, error: couponError } = await supabase
          .rpc('increment_coupon_usage', { coupon_id: orderData.coupon_id });

        if (couponError) {
          console.error('Error incrementing coupon usage:', couponError);
        } else if (couponResult && !couponResult.success) {
          console.error('Coupon usage increment failed:', couponResult.error);
        } else {
          console.log('Coupon usage incremented successfully:', couponResult);
        }
      } catch (err) {
        console.error('Error incrementing coupon usage:', err);
      }
    }

    return NextResponse.json({
      message: 'Order created successfully',
      orderId: order.id,
      order
    });

  } catch (error) {
    console.error('Error creating order from session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
