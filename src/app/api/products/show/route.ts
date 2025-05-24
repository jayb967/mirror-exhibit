import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Function to return the company logo as placeholder image
function getPlaceholderImage(): string {
  // Return the company logo instead of random generated images
  return '/assets/img/logo/ME_Logo.png';
}

export async function GET() {
  try {
    // Create a Supabase client for server-side use
    const supabase = await createServerSupabaseClient();

    // Add cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    console.log('API: /api/products/show - Fetching products - DEBUG');

    // Fetch active products with related data - simplified query for debugging
    // Only select basic fields first to see if products exist
    const { data, error, count } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        base_price,
        image_url,
        is_featured,
        meta_keywords
      `, { count: 'exact' })
      // Removed is_active filter to see if there are any products at all
      .order('is_featured', { ascending: false }) // Featured products first
      .limit(15); // Increased limit to see more products

    // Handle database errors
    if (error) {
      console.error('API: /api/products/show - Error fetching products:', error);

      // If the error is related to missing columns or tables, return empty products
      if (error.code === '42703' || error.code === '42P01') {
        console.log('API: /api/products/show - Database schema issue, returning empty products array');
        return NextResponse.json({
          success: true,
          products: []
        });
      }

      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500, headers }
      );
    }

    // Handle empty results
    if (!data || data.length === 0) {
      console.log('API: /api/products/show - No products found in database');
      // Return empty products array with cache headers
      return NextResponse.json({
        success: true,
        products: []
      }, { headers });
    }

    console.log(`API: /api/products/show - Found ${data.length} products`);

    // Transform the data to match the expected format
    const transformedData = {
      success: true,
      products: data.map(product => ({
        id: product.id,
        title: product.name, // Only use name field
        description: product.description,
        // Use base_price instead of price
        price: product.base_price,
        image: product.image_url || getPlaceholderImage(),
        brand: 'Unknown Brand', // Simplified for debugging
        category: 'Uncategorized', // Simplified for debugging
        variations: [], // Simplified for debugging
        is_featured: product.is_featured || false,
        // Use meta_keywords as handle for compatibility
        handle: product.meta_keywords || ''
      }))
    };

    console.log(`API: /api/products/show - Returning ${transformedData.products.length} transformed products`);

    // Log a sample product to verify data structure
    if (transformedData.products.length > 0) {
      console.log('API: /api/products/show - Sample product:', JSON.stringify(transformedData.products[0], null, 2));
    }

    return NextResponse.json(transformedData, { headers });
  } catch (error) {
    console.error('Error in products API:', error);
    // Even on error, return a valid response with cache headers
    const errorHeaders = new Headers();
    errorHeaders.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    return NextResponse.json(
      {
        success: true,
        products: [],
        error: 'Internal server error'
      },
      {
        status: 200, // Return 200 with empty products to avoid breaking the UI
        headers: errorHeaders     // Include cache headers
      }
    );
  }
}
