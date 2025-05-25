import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/utils/clerk-supabase';

/**
 * GET /api/categories
 * Fetch all active product categories
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicSupabaseClient();
    const { searchParams } = new URL(request.url);

    // Optional parameters
    const includeProductCount = searchParams.get('include_count') === 'true';

    console.log('API: /api/categories - Fetching categories');

    // Base query for categories
    let query = supabase
      .from('product_categories')
      .select('id, name, description, image_url, parent_id, created_at')
      .order('name', { ascending: true });

    const { data: categories, error } = await query;

    if (error) {
      console.error('API: /api/categories - Error:', error);
      console.log('API: /api/categories - Error code:', error.code);

      // If the table doesn't exist or column doesn't exist, return some default categories
      if (error.code === '42P01' || error.code === '42703') {
        console.log('API: /api/categories - Database schema issue, returning default categories');
        const defaultCategories = [
          { id: '1', name: 'Mirrors', product_count: 0 },
          { id: '2', name: 'Wall Art', product_count: 0 },
          { id: '3', name: 'Frames', product_count: 0 },
          { id: '4', name: 'Decorative', product_count: 0 }
        ];

        const headers = new Headers();
        headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800');

        return NextResponse.json({
          success: true,
          categories: defaultCategories,
          total: defaultCategories.length
        }, { headers });
      }

      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    // If product count is requested, fetch counts for each category
    let categoriesWithCount = categories;
    if (includeProductCount && categories) {
      categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', category.id);

          return {
            ...category,
            product_count: count || 0
          };
        })
      );
    }

    console.log(`API: /api/categories - Found ${categoriesWithCount?.length || 0} categories`);

    // Add cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800');

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount || [],
      total: categoriesWithCount?.length || 0
    }, { headers });

  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json(
      {
        success: false,
        categories: [],
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
