import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/utils/clerk-supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Function to return the company logo as placeholder image
function getPlaceholderImage(): string {
  // Return the company logo instead of random generated images
  return '/assets/img/logo/ME_Logo.png';
}

export async function GET(request: NextRequest) {
  try {
    // Create a public Supabase client for public product access (no auth required)
    const supabase = createPublicSupabaseClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'newest';
    const search = searchParams.get('search') || '';
    const size = searchParams.get('size') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const tags = searchParams.get('tags') || ''; // Comma-separated tag names
    const limit = parseInt(searchParams.get('limit') || '50');

    // Add cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    console.log('API: /api/products/show - Fetching products with filters:', {
      sortBy,
      search,
      size,
      category,
      brand,
      tags,
      limit
    });

    // Build the query with filters - include variations for product options
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        base_price,
        image_url,
        is_featured,
        meta_keywords,
        created_at,
        brand_id,
        category_id,
        variations:product_variations(
          id,
          price,
          sku,
          size:product_sizes(id, name, price_adjustment),
          frame_type:frame_types(id, name, price_adjustment)
        )
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,meta_keywords.ilike.%${search}%`);
    }

    // Apply category filter - we'll implement this with a separate lookup
    // For now, skip category and brand filtering to get basic products working
    // TODO: Implement proper filtering with separate queries

    // Note: Tag filtering will be implemented later when we add proper tag joins

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        query = query.order('base_price', { ascending: true });
        break;
      case 'price_high':
        query = query.order('base_price', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('name', { ascending: false });
        break;
      case 'featured':
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply limit
    query = query.limit(limit);

    const { data, error } = await query;

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
        title: product.name,
        description: product.description,
        price: product.base_price,
        base_price: product.base_price,
        image: product.image_url || getPlaceholderImage(),
        image_url: product.image_url || getPlaceholderImage(),
        brand: 'Mirror Exhibit', // Default brand for now
        brandData: null, // Will be loaded separately
        category: 'Uncategorized', // Default category for now
        categoryData: null, // Will be loaded separately
        tags: [], // Will be loaded separately for now
        variations: product.variations || [], // Include variations data
        is_featured: product.is_featured || false,
        handle: product.meta_keywords || '',
        created_at: product.created_at,
        brand_id: product.brand_id,
        category_id: product.category_id
      })),
      filters: {
        sortBy,
        search,
        size,
        category,
        brand,
        tags,
        total: data.length
      }
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
