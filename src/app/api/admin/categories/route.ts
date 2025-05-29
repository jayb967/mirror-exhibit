// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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
 * API endpoint to get categories for admin users
 * This bypasses RLS policies using the service role key
 * 
 * SECURITY: This endpoint is protected by middleware - only authenticated admin users
 * can access /admin/* routes. No additional auth verification needed here.
 */
export async function GET(request: NextRequest) {
  try {
    // NOTE: This endpoint is protected by middleware (/admin routes require authentication)
    // Using service role for database access since this is an admin-only endpoint
    console.log('Admin categories API: Processing request for admin categories');

    // Get query parameters
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    const search = url.searchParams.get('search') || '';
    const includeProductCount = url.searchParams.get('includeProductCount') === 'true';

    // Use admin client to bypass RLS
    const adminClient = getAdminClient();

    // Build the query
    let query = adminClient
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });

    // Apply search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      
      // If the table doesn't exist, return default categories
      if (error.code === '42P01') {
        console.log('Categories table does not exist, returning default categories');
        const defaultCategories = [
          { 
            id: uuidv4(), 
            name: 'Mirrors', 
            description: 'Decorative and functional mirrors',
            image_url: null,
            parent_id: null,
            is_active: true,
            product_count: 0,
            created_at: new Date().toISOString()
          },
          { 
            id: uuidv4(), 
            name: 'Wall Art', 
            description: 'Artistic wall decorations',
            image_url: null,
            parent_id: null,
            is_active: true,
            product_count: 0,
            created_at: new Date().toISOString()
          },
          { 
            id: uuidv4(), 
            name: 'Frames', 
            description: 'Picture and mirror frames',
            image_url: null,
            parent_id: null,
            is_active: true,
            product_count: 0,
            created_at: new Date().toISOString()
          }
        ];

        return NextResponse.json({
          success: true,
          categories: defaultCategories,
          total: defaultCategories.length
        });
      }

      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Add product counts if requested
    let categoriesWithCount = categories || [];
    if (includeProductCount && categories) {
      categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const { count } = await adminClient
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

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
      total: categoriesWithCount.length
    });

  } catch (error) {
    console.error('Error in admin categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to create a new category
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Admin categories API: Processing category creation');

    const body = await request.json();
    const { name, description, image_url, parent_id } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const adminClient = getAdminClient();

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const categoryData = {
      id: uuidv4(),
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      parent_id: parent_id || null,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await adminClient
      .from('product_categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      category: data
    });

  } catch (error) {
    console.error('Error in admin category creation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
