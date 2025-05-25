import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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

    // Get cart items with product details
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products!cart_items_product_id_fkey (
          id,
          name,
          base_price,
          image_url
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart:', error);
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }

    // Map the data to ensure price compatibility
    const mappedItems = (cartItems || []).map(item => ({
      ...item,
      product: item.products ? {
        ...item.products,
        price: item.products.base_price // Map base_price to price for compatibility
      } : undefined
    }));

    return NextResponse.json({ 
      cartItems: mappedItems,
      message: 'Cart loaded successfully'
    });

  } catch (error) {
    console.error('Error in cart loading:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
