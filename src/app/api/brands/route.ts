import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, createServiceRoleSupabaseClient } from '@/utils/clerk-supabase';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/brands
 * Fetch all brands with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const includeInactive = searchParams.get('includeInactive') === 'true';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('API: /api/brands - Fetching brands with filters:', {
      includeInactive,
      search,
      limit
    });

    // Build query
    let query = supabase
      .from('brands_with_product_counts')
      .select('*');

    // Apply filters
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply sorting and limit
    query = query
      .order('name', { ascending: true })
      .limit(limit);

    const { data: brands, error } = await query;

    if (error) {
      console.error('API: /api/brands - Error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch brands',
        details: error.message
      }, { status: 500 });
    }

    console.log(`API: /api/brands - Found ${brands?.length || 0} brands`);

    // Add cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800');

    return NextResponse.json({
      success: true,
      brands: brands || [],
      total: brands?.length || 0
    }, { headers });

  } catch (error) {
    console.error('Error in brands API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * POST /api/brands
 * Create a new brand (Service role - no auth required)
 */
export async function POST(request: NextRequest) {
  try {
    // Use service role client - no auth required
    const supabase = createServiceRoleSupabaseClient();
    const body = await request.json();

    const { name, description, logo_url, website_url, is_active = true } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Brand name is required'
      }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    console.log('API: /api/brands - Creating brand:', { name, slug });

    const { data: brand, error } = await supabase
      .from('brands')
      .insert({
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_active,
        created_by: 'admin' // Service role creation
      })
      .select()
      .single();

    if (error) {
      console.error('API: /api/brands - Create error:', error);

      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: false,
          error: 'Brand name already exists'
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create brand',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: /api/brands - Brand created:', brand.id);

    return NextResponse.json({
      success: true,
      brand
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
