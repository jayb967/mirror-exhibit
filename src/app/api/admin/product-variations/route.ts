// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { verifyAdminAccess } from '@/utils/admin-auth';

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
 * API endpoint to create or update product variations with admin privileges
 * This bypasses RLS policies using the service role key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access using centralized utility
    const authResult = await verifyAdminAccess({
      operation: 'create/update product variations'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    // Get request body
    const body = await request.json();
    const {
      productId,
      sizeId,
      frameTypeId,
      variationData = {},
      action = 'create'
    } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get admin client
    const adminClient = getAdminClient();

    // Check if variation exists
    const { data: existingVariation } = await adminClient
      .from('product_variations')
      .select('id')
      .eq('product_id', productId)
      .eq('size_id', sizeId)
      .eq('frame_type_id', frameTypeId)
      .maybeSingle();

    if (existingVariation && action === 'create') {
      // Update existing variation
      // Filter out any fields that don't exist in the database schema
      const { cost, ...validVariationData } = variationData;

      const { error: updateError } = await adminClient
        .from('product_variations')
        .update(validVariationData)
        .eq('id', existingVariation.id);

      if (updateError) {
        console.error('Error updating variation:', updateError);
        return NextResponse.json(
          { error: `Failed to update variation: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Successfully updated variation',
        id: existingVariation.id
      });
    } else if (action === 'create') {
      // Create new variation
      const variationId = uuidv4();

      // Filter out any fields that don't exist in the database schema
      const { cost, ...validVariationData } = variationData;

      const newVariation = {
        id: variationId,
        product_id: productId,
        size_id: sizeId,
        frame_type_id: frameTypeId,
        ...validVariationData
      };

      const { error: insertError } = await adminClient
        .from('product_variations')
        .insert(newVariation);

      if (insertError) {
        console.error('Error creating variation:', insertError);
        return NextResponse.json(
          { error: `Failed to create variation: ${insertError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Successfully created variation',
        id: variationId
      });
    } else if (action === 'update' && body.id) {
      // Update specific variation by ID
      // Filter out any fields that don't exist in the database schema
      const { cost, ...validVariationData } = variationData;

      const { error: updateError } = await adminClient
        .from('product_variations')
        .update(validVariationData)
        .eq('id', body.id);

      if (updateError) {
        console.error('Error updating variation:', updateError);
        return NextResponse.json(
          { error: `Failed to update variation: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Successfully updated variation',
        id: body.id
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing ID for update' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in product variation API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to delete product variations with admin privileges
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access using centralized utility
    const authResult = await verifyAdminAccess({
      operation: 'delete product variations'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    // Get request body
    const body = await request.json();
    const { id, productId, sizeId, frameTypeId } = body;

    if (!id && (!productId || !sizeId || !frameTypeId)) {
      return NextResponse.json(
        { error: 'Either variation ID or product ID + size ID + frame type ID is required' },
        { status: 400 }
      );
    }

    // Get admin client
    const adminClient = getAdminClient();

    let deleteQuery = adminClient.from('product_variations').delete();

    if (id) {
      // Delete by ID
      deleteQuery = deleteQuery.eq('id', id);
    } else {
      // Delete by combination
      deleteQuery = deleteQuery
        .eq('product_id', productId)
        .eq('size_id', sizeId)
        .eq('frame_type_id', frameTypeId);
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      console.error('Error deleting variation:', deleteError);
      return NextResponse.json(
        { error: `Failed to delete variation: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Successfully deleted variation'
    });

  } catch (error) {
    console.error('Error in product variation DELETE API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
