import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAccess } from '@/utils/admin-auth';
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
 * API endpoint to create or update products with admin privileges
 * This bypasses RLS policies using the service role key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access using centralized utility
    const authResult = await verifyAdminAccess({
      operation: 'create/update products'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    // Get request body
    const body = await request.json();
    const { products, action = 'create' } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Products array is required' },
        { status: 400 }
      );
    }

    // Get admin client
    const adminClient = getAdminClient();

    // Process products based on action
    if (action === 'create') {
      // Add IDs to products if not provided
      const productsWithIds = products.map(product => ({
        id: product.id || uuidv4(),
        ...product,
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
      }));

      // Insert products
      const { data, error } = await adminClient
        .from('products')
        .insert(productsWithIds)
        .select('id');

      if (error) {
        console.error('Error creating products:', error);
        return NextResponse.json(
          { error: `Failed to create products: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: `Successfully created ${data?.length || 0} products`,
        ids: data?.map(item => item.id) || []
      });
    } else if (action === 'update') {
      // Process each product update individually
      const results = await Promise.all(
        products.map(async (product) => {
          if (!product.id) {
            return { success: false, error: 'Product ID is required for updates' };
          }

          const { id, ...updateData } = product;
          updateData.updated_at = new Date().toISOString();

          const { data, error } = await adminClient
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select('id');

          if (error) {
            return { success: false, id, error: error.message };
          }

          return { success: true, id };
        })
      );

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success);

      return NextResponse.json({
        message: `Updated ${successful} products, ${failed.length} failed`,
        results
      });
    } else {
      return NextResponse.json(
        { error: `Invalid action: ${action}. Supported actions are 'create' and 'update'` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in product API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
