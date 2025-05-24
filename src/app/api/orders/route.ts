import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new order
 */
export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const {
      items,
      customer,
      shipping,
      billing,
      subtotal,
      tax,
      shipping: shippingCost,
      total,
      notes,
      createAccount
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!customer || !customer.email || !customer.firstName || !customer.lastName) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      );
    }

    if (!shipping || !shipping.address || !shipping.city || !shipping.state || !shipping.postalCode) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    // Generate order ID
    const orderId = uuidv4();

    // Prepare order data
    const orderData = {
      id: orderId,
      user_id: userId,
      guest_email: !userId ? customer.email : null,
      guest_token: !userId ? `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
      status: 'pending',
      subtotal: parseFloat(subtotal.toString()),
      tax_amount: parseFloat(tax.toString()),
      shipping_cost: parseFloat(shippingCost.toString()),
      total_amount: parseFloat(total.toString()),
      currency: 'USD',
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create shipping address
    const shippingAddressData = {
      order_id: orderId,
      first_name: shipping.firstName || customer.firstName,
      last_name: shipping.lastName || customer.lastName,
      company: shipping.company || '',
      address_line_1: shipping.address,
      address_line_2: shipping.apartment || '',
      city: shipping.city,
      state: shipping.state,
      postal_code: shipping.postalCode,
      country: shipping.country || 'United States',
      phone: shipping.phone || customer.phone,
      created_at: new Date().toISOString()
    };

    const { error: shippingError } = await supabase
      .from('shipping_addresses')
      .insert(shippingAddressData);

    if (shippingError) {
      console.error('Error creating shipping address:', shippingError);
      // Continue with order creation even if shipping address fails
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: parseFloat(item.price.toString()),
      created_at: new Date().toISOString()
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // If user wants to create an account and is not authenticated
    if (createAccount && !userId) {
      // This would be handled by the frontend after successful order creation
      // For now, we'll just store the flag in the order
      await supabase
        .from('orders')
        .update({
          notes: `${notes || ''}\n[CREATE_ACCOUNT_REQUESTED]`.trim()
        })
        .eq('id', orderId);
    }

    return NextResponse.json({
      orderId,
      order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get orders for the authenticated user
 */
export async function GET(req: Request) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client with Clerk auth
    const supabase = await createServerSupabaseClient();

    // Get user's orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          id,
          product_id,
          quantity,
          price,
          product:products(
            id,
            name,
            image_url
          )
        ),
        shipping_address:shipping_addresses(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
