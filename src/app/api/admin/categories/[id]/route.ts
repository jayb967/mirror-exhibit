// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * GET /api/admin/categories/[id]
 * Fetch a specific category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = getAdminClient();
    const { id } = params;

    console.log('Admin categories API: Fetching category:', id);

    const { data: category, error } = await adminClient
      .from('product_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Admin categories API: Error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Category not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to fetch category',
        details: error.message
      }, { status: 500 });
    }

    // Get product count for this category
    const { count } = await adminClient
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        product_count: count || 0
      }
    });

  } catch (error) {
    console.error('Admin categories API: Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/categories/[id]
 * Update a specific category
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = getAdminClient();
    const { id } = params;
    const body = await request.json();

    console.log('Admin categories API: Updating category:', id);

    const { name, description, image_url, parent_id, is_active } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Category name is required'
      }, { status: 400 });
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const updateData = {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      parent_id: parent_id || null,
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await adminClient
      .from('product_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Admin categories API: Update error:', error);

      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Category not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to update category',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      category: data
    });

  } catch (error) {
    console.error('Admin categories API: Update unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete a specific category
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminClient = getAdminClient();
    const { id } = params;

    console.log('Admin categories API: Deleting category:', id);

    // Check if category has products
    const { data: products, error: checkError } = await adminClient
      .from('products')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (checkError) {
      console.error('Admin categories API: Check error:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check category usage'
      }, { status: 500 });
    }

    if (products && products.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete category that has products assigned to it'
      }, { status: 400 });
    }

    // Check if category has subcategories
    const { data: subcategories, error: subCheckError } = await adminClient
      .from('product_categories')
      .select('id')
      .eq('parent_id', id)
      .limit(1);

    if (subCheckError) {
      console.error('Admin categories API: Subcategory check error:', subCheckError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check subcategories'
      }, { status: 500 });
    }

    if (subcategories && subcategories.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete category that has subcategories'
      }, { status: 400 });
    }

    // Delete the category
    const { error: deleteError } = await adminClient
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Admin categories API: Delete error:', deleteError);

      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Category not found'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to delete category',
        details: deleteError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Admin categories API: Delete unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
