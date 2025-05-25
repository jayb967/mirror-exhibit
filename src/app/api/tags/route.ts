import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, createServiceRoleSupabaseClient } from '@/utils/clerk-supabase';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/tags
 * Fetch all tags with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const includeInactive = searchParams.get('includeInactive') === 'true';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('API: /api/tags - Fetching tags with filters:', {
      includeInactive,
      search,
      category,
      limit
    });

    // Build query
    let query = supabase
      .from('tags_with_product_counts')
      .select('*');

    // Apply filters
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    // Apply sorting and limit
    query = query
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .limit(limit);

    const { data: tags, error } = await query;

    if (error) {
      console.error('API: /api/tags - Error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch tags',
        details: error.message
      }, { status: 500 });
    }

    console.log(`API: /api/tags - Found ${tags?.length || 0} tags`);

    // Add cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1800');

    return NextResponse.json({
      success: true,
      tags: tags || [],
      total: tags?.length || 0
    }, { headers });

  } catch (error) {
    console.error('Error in tags API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * POST /api/tags
 * Create a new tag (Service role - no auth required)
 */
export async function POST(request: NextRequest) {
  try {
    // Use service role client - no auth required
    const supabase = createServiceRoleSupabaseClient();
    const body = await request.json();

    const { name, description, color = '#000000', category = 'theme', is_active = true } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Tag name is required'
      }, { status: 400 });
    }

    // Validate color format
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!colorRegex.test(color)) {
      return NextResponse.json({
        success: false,
        error: 'Color must be a valid hex color code (e.g., #FF0000)'
      }, { status: 400 });
    }

    // Validate category
    const validCategories = ['fashion', 'emotion', 'style', 'theme'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        success: false,
        error: `Category must be one of: ${validCategories.join(', ')}`
      }, { status: 400 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    console.log('API: /api/tags - Creating tag:', { name, slug, category });

    const { data: tag, error } = await supabase
      .from('tags')
      .insert({
        name,
        slug,
        description,
        color,
        category,
        is_active,
        created_by: 'admin' // Service role creation
      })
      .select()
      .single();

    if (error) {
      console.error('API: /api/tags - Create error:', error);

      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({
          success: false,
          error: 'Tag name already exists'
        }, { status: 409 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create tag',
        details: error.message
      }, { status: 500 });
    }

    console.log('API: /api/tags - Tag created:', tag.id);

    return NextResponse.json({
      success: true,
      tag
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
