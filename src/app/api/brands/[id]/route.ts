import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/utils/clerk-supabase';

/**
 * GET /api/brands/[id]
 * Fetch a specific brand by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminSupabaseClient();
    const { id } = params;

    console.log('API: /api/brands/[id] - Fetching brand:', id);

    const { data: brand, error } = await supabase
      .from('brands_with_product_counts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('API: /api/brands/[id] - Error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Brand not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch brand',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: /api/brands/[id] - Brand found:', brand.name);

    return NextResponse.json({
      success: true,
      brand
    });

  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/brands/[id]
 * Update a specific brand (Service role - no auth required)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use admin client - no auth required
    const supabase = createAdminSupabaseClient();
    const { id } = params;
    const body = await request.json();

    const { name, description, logo_url, website_url, is_active } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Brand name is required'
      }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    console.log('API: /api/brands/[id] - Updating brand:', id);

    const { data: brand, error } = await supabase
      .from('brands')
      .update({
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('API: /api/brands/[id] - Update error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Brand not found'
        }, { status: 404 });
      }

      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: false,
          error: 'Brand name already exists'
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to update brand',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: /api/brands/[id] - Brand updated:', brand.name);

    return NextResponse.json({
      success: true,
      brand
    });

  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/brands/[id]
 * Delete a specific brand (Service role - no auth required)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use admin client - no auth required
    const supabase = createAdminSupabaseClient();
    const { id } = params;

    console.log('API: /api/brands/[id] - Deleting brand:', id);

    // Check if brand has products
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('brand_id', id)
      .limit(1);

    if (checkError) {
      console.error('API: /api/brands/[id] - Check error:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check brand usage'
      }, { status: 500 });
    }

    if (products && products.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete brand that has products assigned to it'
      }, { status: 409 });
    }

    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('API: /api/brands/[id] - Delete error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Brand not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to delete brand',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: /api/brands/[id] - Brand deleted');

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}