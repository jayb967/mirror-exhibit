import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Function to return the company logo as placeholder image
function getPlaceholderImage(): string {
  // Return the company logo instead of random generated images
  return '/assets/img/logo/ME_Logo.png';
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch all products with their variations, sizes, and frame types
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:product_categories(*),
        variations:product_variations(
          *,
          size:product_sizes(*),
          frame_type:frame_types(*)
        )
      `);

    if (error) {
      console.error('Error fetching all products:', error);
      return NextResponse.json(
        { error: 'Error loading products' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedData = {
      success: true,
      products: data.map(product => ({
        id: product.id,
        title: product.name,
        description: product.description,
        price: product.base_price,
        image: product.image_url || getPlaceholderImage(),
        brand: product.brand?.name || 'Unknown Brand',
        category: product.category?.name || 'Uncategorized',
        variations: product.variations || [],
        is_featured: product.is_featured || false
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
