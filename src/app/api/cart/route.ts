import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Add item to cart
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, quantity } = body;
    
    // Validate request
    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid request. Product ID and quantity > 0 are required.' },
        { status: 400 }
      );
    }

    // Get user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if product exists and has enough stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock_quantity')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json({ 
        error: 'Not enough stock available',
        availableStock: product.stock_quantity
      }, { status: 400 });
    }

    // Add to cart using the stored procedure
    const { data: cartItem, error: cartError } = await supabase
      .rpc('add_to_cart', {
        p_user_id: session.user.id,
        p_product_id: productId,
        p_quantity: quantity
      });

    if (cartError) {
      console.error('Error adding to cart:', cartError);
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Item added to cart',
      cartItem
    });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get cart items
export async function GET(req: Request) {
  try {
    // Get user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get cart items with product details
    const { data, error } = await supabase
      .rpc('get_cart_with_products', {
        p_user_id: session.user.id
      });

    if (error) {
      console.error('Error fetching cart:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart items' },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update cart item
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { productId, quantity } = body;
    
    // Validate request
    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request. Product ID and quantity are required.' },
        { status: 400 }
      );
    }

    // Get user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update cart item quantity using the stored procedure
    const { data: cartItem, error: cartError } = await supabase
      .rpc('update_cart_quantity', {
        p_user_id: session.user.id,
        p_product_id: productId,
        p_quantity: quantity
      });

    if (cartError) {
      console.error('Error updating cart:', cartError);
      return NextResponse.json(
        { error: 'Failed to update cart item' },
        { status: 500 }
      );
    }

    // If quantity was 0, item was deleted and response is empty
    if (quantity <= 0) {
      return NextResponse.json({
        message: 'Item removed from cart'
      });
    }

    return NextResponse.json({
      message: 'Cart updated',
      cartItem
    });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete item from cart
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete cart item
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', session.user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from cart:', error);
      return NextResponse.json(
        { error: 'Failed to remove item from cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Cart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 