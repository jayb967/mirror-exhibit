import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Get guest cart items
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const guestToken = url.searchParams.get('token');
    
    if (!guestToken) {
      return NextResponse.json(
        { error: 'Guest token is required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get cart items with product details
    const { data, error } = await supabase
      .rpc('get_guest_cart_with_products', {
        p_guest_token: guestToken
      });
    
    if (error) {
      console.error('Error fetching guest cart:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ items: data });
  } catch (error) {
    console.error('Guest cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add item to guest cart
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guestToken, productId, quantity } = body;
    
    // Validate request
    if (!guestToken || !productId || !quantity) {
      return NextResponse.json(
        { error: 'Invalid request. Guest token, product ID, and quantity are required.' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Add item to cart
    const { data, error } = await supabase
      .rpc('add_to_guest_cart', {
        p_guest_token: guestToken,
        p_product_id: productId,
        p_quantity: quantity
      });
    
    if (error) {
      console.error('Error adding item to guest cart:', error);
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Guest cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update guest cart item quantity
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { guestToken, productId, quantity } = body;
    
    // Validate request
    if (!guestToken || !productId || typeof quantity !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. Guest token, product ID, and quantity are required.' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Update item quantity
    const { data, error } = await supabase
      .rpc('update_guest_cart_quantity', {
        p_guest_token: guestToken,
        p_product_id: productId,
        p_quantity: quantity
      });
    
    if (error) {
      console.error('Error updating guest cart quantity:', error);
      return NextResponse.json(
        { error: 'Failed to update cart quantity' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ item: data });
  } catch (error) {
    console.error('Guest cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete all guest cart items
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const guestToken = url.searchParams.get('token');
    
    if (!guestToken) {
      return NextResponse.json(
        { error: 'Guest token is required' },
        { status: 400 }
      );
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Delete all cart items for this guest
    const { error } = await supabase
      .from('guest_cart_items')
      .delete()
      .eq('guest_token', guestToken);
    
    if (error) {
      console.error('Error clearing guest cart:', error);
      return NextResponse.json(
        { error: 'Failed to clear cart' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guest cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
