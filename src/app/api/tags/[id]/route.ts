import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/utils/clerk-supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/tags/[id]
 * Fetch a specific tag by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminSupabaseClient();
    const { id } = params;

    console.log('API: /api/tags/[id] - Fetching tag:', id);

    const { data: tag, error } = await supabase
      .from('tags_with_product_counts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('API: /api/tags/[id] - Error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Tag not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch tag',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: /api/tags/[id] - Tag found:', tag.name);

    return NextResponse.json({
      success: true,
      tag
    });

  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/tags/[id]
 * Update a specific tag (Service role - no auth required)
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

    const { name, description, color, category, is_active } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Tag name is required'
      }, { status: 400 });
    }

    // Validate color format if provided
    if (color) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!colorRegex.test(color)) {
        return NextResponse.json({
          success: false,
          error: 'Color must be a valid hex color code (e.g., #FF0000)'
        }, { status: 400 });
      }
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['fashion', 'emotion', 'style', 'theme'];
      if (!validCategories.includes(category)) {
        return NextResponse.json({
          success: false,
          error: `Category must be one of: ${validCategories.join(', ')}`
        }, { status: 400 });
      }
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    console.log('API: /api/tags/[id] - Updating tag:', id);

    const { data: tag, error } = await supabase
      .from('tags')
      .update({
        name,
        slug,
        description,
        color,
        category,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('API: /api/tags/[id] - Update error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Tag not found'
        }, { status: 404 });
      }

      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: false,
          error: 'Tag name already exists'
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to update tag',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: /api/tags/[id] - Tag updated:', tag.name);

    return NextResponse.json({
      success: true,
      tag
    });

  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/tags/[id]
 * Delete a specific tag (Service role - no auth required)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use admin client - no auth required
    const supabase = createAdminSupabaseClient();
    const { id } = params;

    console.log('API: /api/tags/[id] - Deleting tag:', id);

    // Check if tag has products
    const { data: productTags, error: checkError } = await supabase
      .from('product_tags')
      .select('id')
      .eq('tag_id', id)
      .limit(1);

    if (checkError) {
      console.error('API: /api/tags/[id] - Check error:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check tag usage'
      }, { status: 500 });
    }

    if (productTags && productTags.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete tag that is assigned to products'
      }, { status: 409 });
    }

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('API: /api/tags/[id] - Delete error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Tag not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to delete tag',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: /api/tags/[id] - Tag deleted');

    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
