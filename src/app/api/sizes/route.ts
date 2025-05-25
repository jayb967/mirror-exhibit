import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/utils/clerk-supabase';

/**
 * GET /api/sizes
 * Fetch all available product sizes
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicSupabaseClient();

    console.log('API: /api/sizes - Fetching product sizes');

    // Fetch sizes from product_sizes table - order by price_adjustment to ensure Small (0) comes first
    const { data: sizes, error } = await supabase
      .from('product_sizes')
      .select('id, name, code, dimensions, price_adjustment')
      .order('price_adjustment', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('API: /api/sizes - Error:', error);

      // Return default sizes if there's a database error
      const defaultSizes = [
        { id: '1', name: 'Small', code: 'sm', dimensions: '12" x 16"', price_adjustment: 0 },
        { id: '2', name: 'Medium', code: 'md', dimensions: '18" x 24"', price_adjustment: 30 },
        { id: '3', name: 'Large', code: 'lg', dimensions: '24" x 36"', price_adjustment: 60 }
      ];

      return NextResponse.json({
        success: true,
        sizes: defaultSizes,
        total: defaultSizes.length
      });
    }

    console.log(`API: /api/sizes - Found ${sizes?.length || 0} sizes`);

    // Add cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800');

    return NextResponse.json({
      success: true,
      sizes: sizes || [],
      total: sizes?.length || 0
    }, { headers });

  } catch (error) {
    console.error('Error in sizes API:', error);
    return NextResponse.json(
      {
        success: true,
        sizes: [],
        total: 0,
        error: 'Internal server error'
      },
      { status: 200 } // Return 200 to avoid breaking the UI
    );
  }
}
