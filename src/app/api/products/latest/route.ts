import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/utils/clerk-supabase';

/**
 * GET /api/products/latest
 * Fetch latest products ordered by creation date
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createPublicSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    // Optional parameters
    const limit = parseInt(searchParams.get('limit') || '3');
    
    console.log(`API: /api/products/latest - Fetching ${limit} latest products`);
    
    // Fetch latest products ordered by created_at
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        base_price,
        image_url,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('API: /api/products/latest - Error:', error);
      
      // Return empty array if there's a database error
      return NextResponse.json({
        success: true,
        products: [],
        total: 0
      });
    }
    
    // Transform the data to match expected format
    const transformedProducts = products?.map(product => ({
      id: product.id,
      title: product.name,
      price: product.base_price,
      image: product.image_url || '/assets/img/logo/ME_Logo.png',
      created_at: product.created_at
    })) || [];
    
    console.log(`API: /api/products/latest - Found ${transformedProducts.length} latest products`);
    
    // Add cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800');
    
    return NextResponse.json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length
    }, { headers });
    
  } catch (error) {
    console.error('Error in latest products API:', error);
    return NextResponse.json(
      {
        success: true,
        products: [],
        total: 0,
        error: 'Internal server error'
      },
      { status: 200 } // Return 200 to avoid breaking the UI
    );
  }
}
