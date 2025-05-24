// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role for admin access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 });
    }

    // Check cart_items table
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', userId);

    // Check cart_tracking table
    const { data: cartTracking, error: trackingError } = await supabaseAdmin
      .from('cart_tracking')
      .select('*')
      .eq('user_id', userId);

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    // Check product_variations table
    const { data: variations, error: variationsError } = await supabaseAdmin
      .from('product_variations')
      .select('*')
      .limit(5);

    // Check products table
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, base_price')
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        userId,
        user: user?.user ? { id: user.user.id, email: user.user.email } : null,
        userError: userError?.message,
        cartItems: cartItems || [],
        cartError: cartError?.message,
        cartTracking: cartTracking || [],
        trackingError: trackingError?.message,
        sampleVariations: variations || [],
        variationsError: variationsError?.message,
        sampleProducts: products || [],
        productsError: productsError?.message,
        tableInfo: {
          cartItemsCount: cartItems?.length || 0,
          cartTrackingCount: cartTracking?.length || 0,
          variationsCount: variations?.length || 0,
          productsCount: products?.length || 0
        }
      }
    });

  } catch (error: any) {
    console.error('Debug cart error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, productId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (action === 'test_add_to_cart') {
      if (!productId) {
        return NextResponse.json({ error: 'productId required for test_add_to_cart' }, { status: 400 });
      }

      // Try to add to cart using the old schema function
      try {
        const { data: result1, error: error1 } = await supabaseAdmin.rpc('add_to_cart', {
          p_user_id: userId,
          p_product_id: productId,
          p_quantity: 1
        });

        return NextResponse.json({
          success: true,
          method: 'old_schema',
          result: result1,
          error: error1?.message
        });
      } catch (oldError: any) {
        // Try with product variations
        try {
          // First get a variation for this product
          const { data: variations, error: varError } = await supabaseAdmin
            .from('product_variations')
            .select('id')
            .eq('product_id', productId)
            .limit(1);

          if (varError || !variations || variations.length === 0) {
            return NextResponse.json({
              success: false,
              error: 'No product variations found',
              oldSchemaError: oldError.message,
              variationError: varError?.message
            });
          }

          const { data: result2, error: error2 } = await supabaseAdmin.rpc('add_to_cart', {
            p_user_id: userId,
            p_product_variation_id: variations[0].id,
            p_quantity: 1
          });

          return NextResponse.json({
            success: true,
            method: 'new_schema',
            variationId: variations[0].id,
            result: result2,
            error: error2?.message,
            oldSchemaError: oldError.message
          });
        } catch (newError: any) {
          return NextResponse.json({
            success: false,
            error: 'Both old and new schema failed',
            oldSchemaError: oldError.message,
            newSchemaError: newError.message
          });
        }
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Debug cart POST error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
