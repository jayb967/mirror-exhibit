import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Function to return the company logo as placeholder image
function getPlaceholderImage(): string {
  return '/assets/img/logo/ME_Logo.png';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '15');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'created_at'; // created_at, view_count, price, name
    const sortOrder = searchParams.get('order') || 'desc'; // asc, desc

    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    // Validate limit (prevent abuse)
    const maxLimit = 50;
    const actualLimit = Math.min(Math.max(limit, 1), maxLimit);

    // Validate sort parameters
    const validSortFields = ['created_at', 'view_count', 'base_price', 'name'];
    const validSortOrders = ['asc', 'desc'];

    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const actualSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';
    const ascending = actualSortOrder === 'asc';

    console.log(`API: /api/products/by-category - Category: ${category}, Sort: ${actualSortBy} ${actualSortOrder}, Limit: ${actualLimit}`);

    // Build query to find products by category
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
      `, { count: 'exact' });

    // Filter by category (try name matching)
    query = query.or(`category.name.ilike.%${category}%`);

    // Apply sorting
    if (actualSortBy === 'base_price') {
      query = query.order('base_price', { ascending });
    } else if (actualSortBy === 'view_count') {
      query = query.order('view_count', { ascending });
    } else if (actualSortBy === 'name') {
      query = query.order('name', { ascending });
    } else {
      query = query.order('created_at', { ascending });
    }

    // Add secondary sort for consistency
    if (actualSortBy !== 'created_at') {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + actualLimit - 1);

    // Execute query
    const { data, error, count } = await query;

    // Handle database errors
    if (error) {
      console.error('API: /api/products/by-category - Error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    // Handle empty results
    if (!data || data.length === 0) {
      console.log(`API: /api/products/by-category - No products found for category: ${category}`);
      return NextResponse.json({
        success: true,
        products: [],
        category: {
          name: category,
          slug: category
        },
        pagination: {
          total: 0,
          limit: actualLimit,
          offset: offset,
          has_more: false
        },
        sorting: {
          sort_by: actualSortBy,
          order: actualSortOrder
        }
      });
    }

    console.log(`API: /api/products/by-category - Found ${data.length} products for category: ${category}`);

    // Get category info from the first product (since all products have the same category)
    const categoryInfo = data[0]?.category || { name: category };

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
      category: {
        name: categoryInfo.name,
        slug: categoryInfo.name?.toLowerCase().replace(/\s+/g, '-') || category
      },
      pagination: {
        total: totalCount,
        limit: actualLimit,
        offset: offset,
        has_more: hasMore,
        next_offset: hasMore ? offset + actualLimit : null
      },
      sorting: {
        sort_by: actualSortBy,
        order: actualSortOrder
      }
    };

    // Add cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=120, s-maxage=600, stale-while-revalidate=1200');

    console.log(`API: /api/products/by-category - Returning ${transformedProducts.length} products for ${categoryInfo.name}`);

    return NextResponse.json(response, { headers });

  } catch (error) {
    console.error('Error in by-category products API:', error);
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
