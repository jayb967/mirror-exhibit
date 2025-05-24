import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Fetch the product with its variations, sizes, frame types, and images
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
        ),
        product_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json(
        { error: 'Error loading product' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedData = {
      success: true,
      product: {
        id: data.id,
        title: data.name,
        description: data.description,
        price: data.base_price,
        image: data.image_url || '/images/products/default.jpg',
        brand: data.brand?.name || 'Unknown Brand',
        category: data.category?.name || 'Uncategorized',
        variations: data.variations || [],
        product_images: data.product_images || [],
        is_featured: data.is_featured || false
      }
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in product API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
