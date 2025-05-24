import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Function to return the company logo as placeholder image
function getPlaceholderImage(): string {
  // Return the company logo instead of random generated images
  return '/assets/img/logo/ME_Logo.png';
}

export async function GET(
  request: Request
) {
  try {
    // Get the current product ID from the query parameters to exclude it
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('excludeId');
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    // Create a Supabase client for server-side use
    const supabase = createRouteHandlerClient({ cookies });

    // Build the query
    let query = supabase
      .from('products')
      .select(`
        *,
        category:product_categories(id, name),
        brand:brands(id, name),
        variations:product_variations(
          id, price, stock_quantity,
          size:product_sizes(id, name),
          frame_type:frame_types(id, name)
        ),
        images:product_images(id, image_url, is_primary)
      `)
      .eq('is_active', true);

    // Exclude the current product if an ID is provided
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    // Get random products by ordering randomly and limiting
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    // Handle database errors
    if (error) {
      console.error('Error fetching random products:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    // Handle empty results
    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        products: []
      });
    }

    // Transform the data to match the expected format
    const transformedData = {
      success: true,
      products: data.map(product => ({
        id: product.id,
        title: product.name || product.title,
        description: product.description,
        price: product.base_price,
        image: product.image_url || getPlaceholderImage(),
        brand: product.brand?.name || 'Unknown Brand',
        category: product.category?.name || 'Uncategorized',
        variations: product.variations || [],
        is_featured: product.is_featured || false,
        handle: product.handle || product.meta_keywords
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in random products API:', error);
    return NextResponse.json(
      {
        success: true,
        products: [],
        error: 'Internal server error'
      },
      { status: 200 } // Return 200 with empty products to avoid breaking the UI
    );
  }
}
