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
 * API endpoint to create or get product sizes with admin privileges
 * This bypasses RLS policies using the service role key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access using centralized utility
    const authResult = await verifyAdminAccess({
      operation: 'manage product sizes'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    // Get request body
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Size name is required' },
        { status: 400 }
      );
    }

    // Get admin client
    const adminClient = getAdminClient();

    // Check if size exists
    const { data: existingSize } = await adminClient
      .from('product_sizes')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (existingSize) {
      return NextResponse.json({
        message: 'Size already exists',
        id: existingSize.id
      });
    }

    // Create new size
    const sizeId = uuidv4();
    const { error: insertError } = await adminClient
      .from('product_sizes')
      .insert({
        id: sizeId,
        name,
        description: description || `${name} size option`
      });

    if (insertError) {
      console.error('Error creating size:', insertError);
      return NextResponse.json(
        { error: `Failed to create size: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Successfully created size',
      id: sizeId
    });
  } catch (error) {
    console.error('Error in product size API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
