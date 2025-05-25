import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderData, items } = body;

    // Create a Supabase client with service role key for admin operations
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

    // No authentication check needed since we're using service role

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      product_name: item.product_name,
      variation_id: item.variation_id,
      size_name: item.size_name,
      frame_name: item.frame_name
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to clean up the order if items creation failed
      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    // If coupon was applied, increment its usage count
    if (orderData.coupon_id) {
      await supabase
        .rpc('increment_coupon_usage', { coupon_id: orderData.coupon_id })
        .catch(err => console.error('Error incrementing coupon usage:', err));
    }

    return NextResponse.json({
      orderId: order.id,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error in order creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
