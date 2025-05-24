import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Function to return the company logo as placeholder image
function getPlaceholderImage(): string {
  return '/assets/img/logo/ME_Logo.png';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const productType = searchParams.get('type') || 'all'; // featured, popular, most-viewed, new-arrivals, trending, all
    const category = searchParams.get('category'); // category slug or name
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate limit (prevent abuse)
    const maxLimit = 50;
    const actualLimit = Math.min(Math.max(limit, 1), maxLimit);

    console.log(`API: /api/products/filtered - Type: ${productType}, Category: ${category}, Limit: ${actualLimit}`);

    // Build base query
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
        view_count,
        created_at,
        category:product_categories(
          id,
          name
        )
      `);

    // Apply category filter if specified
    if (category) {
      // Try to match by category name
      query = query.or(`category.name.ilike.%${category}%`);
    }

    // Apply product type filtering and sorting
    switch (productType) {
      case 'featured':
        query = query
          .eq('is_featured', true)
          .order('created_at', { ascending: false });
        break;

      case 'popular':
      case 'most-viewed':
        // Use view_count from products table (updated by trigger)
        query = query
          .order('view_count', { ascending: false })
          .order('created_at', { ascending: false }); // Secondary sort
        break;

      case 'new-arrivals':
        query = query
          .order('created_at', { ascending: false });
        break;

      case 'trending':
        // Trending: products with high recent activity
        // For now, use a combination of view_count and recency
        // In the future, this could use the popularity_scores materialized view
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query
          .gte('created_at', thirtyDaysAgo)
          .order('view_count', { ascending: false })
          .order('created_at', { ascending: false });
        break;

      case 'all':
      default:
        // Default sorting: featured first, then by creation date
        query = query
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    query = query
      .range(offset, offset + actualLimit - 1);

    // Execute query
    const { data, error, count } = await query;

    // Handle database errors
    if (error) {
      console.error('API: /api/products/filtered - Error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    // Handle empty results
    if (!data || data.length === 0) {
      console.log('API: /api/products/filtered - No products found');
      return NextResponse.json({
        success: true,
        products: [],
        pagination: {
          total: 0,
          limit: actualLimit,
          offset: offset,
          has_more: false
        },
        filters: {
          type: productType,
          category: category
        }
      });
    }

    console.log(`API: /api/products/filtered - Found ${data.length} products`);

    // Transform the data to match expected format
    const transformedProducts = data.map(product => ({
      id: product.id,
      title: product.name,
      description: product.description || '',
      price: product.base_price || 0,
      image: product.image_url || getPlaceholderImage(),
      brand: 'Mirror Exhibit', // Default brand
      category: product.category?.name || 'Uncategorized',
      category_slug: product.category?.name?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
      variations: [], // Will be populated separately if needed
      is_featured: product.is_featured || false,
      view_count: product.view_count || 0,
      handle: product.meta_keywords || '',
      created_at: product.created_at
    }));

    // Calculate pagination info
    const totalCount = count || 0;
    const hasMore = offset + actualLimit < totalCount;

    const response = {
      success: true,
      products: transformedProducts,
      pagination: {
        total: totalCount,
        limit: actualLimit,
        offset: offset,
        has_more: hasMore,
        next_offset: hasMore ? offset + actualLimit : null
      },
      filters: {
        type: productType,
        category: category
      }
    };

    // Add cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');

    console.log(`API: /api/products/filtered - Returning ${transformedProducts.length} products`);

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error in filtered products API:', error);
    return NextResponse.json(
      {
        success: false,
        products: [],
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
