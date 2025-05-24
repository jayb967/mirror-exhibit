// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getAdminClient } from '@/utils/supabase/admin';

/**
 * API endpoint to set up default product sizes and frame types
 * This is a one-time setup endpoint that should be called by an admin
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Only allow admins to run this setup
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get admin client
    const adminClient = getAdminClient();

    // Default sizes to create
    const defaultSizes = [
      {
        name: 'Small',
        code: 'sm',
        dimensions: '12x16 inches',
        price_adjustment: 0
      },
      {
        name: 'Medium',
        code: 'md',
        dimensions: '18x24 inches',
        price_adjustment: 20
      },
      {
        name: 'Large',
        code: 'lg',
        dimensions: '24x36 inches',
        price_adjustment: 40
      }
    ];

    // Default frame types to create
    const defaultFrameTypes = [
      {
        name: 'Classic Wood',
        material: 'wood',
        color: 'Brown',
        description: 'Traditional wooden frame with a warm finish',
        price_adjustment: 0
      },
      {
        name: 'Modern Metal',
        material: 'metal',
        color: 'Silver',
        description: 'Sleek metal frame with a contemporary look',
        price_adjustment: 15
      },
      {
        name: 'Matte Black',
        material: 'metal',
        color: 'Black',
        description: 'Elegant black frame with a matte finish',
        price_adjustment: 25
      },
      {
        name: 'Gold Accent',
        material: 'metal',
        color: 'Gold',
        description: 'Luxurious gold-toned frame',
        price_adjustment: 35
      }
    ];

    // Check if sizes already exist
    const { data: existingSizes } = await adminClient
      .from('product_sizes')
      .select('count')
      .single();

    // Check if frame types already exist
    const { data: existingFrameTypes } = await adminClient
      .from('frame_types')
      .select('count')
      .single();

    const sizeCount = existingSizes?.count || 0;
    const frameTypeCount = existingFrameTypes?.count || 0;

    // Only create default sizes if none exist
    if (sizeCount === 0) {
      for (const size of defaultSizes) {
        const { error } = await adminClient
          .from('product_sizes')
          .insert({
            id: uuidv4(),
            ...size,
            is_active: true
          });

        if (error) {
          console.error('Error creating size:', error);
          return NextResponse.json(
            { error: `Failed to create size: ${error.message}` },
            { status: 500 }
          );
        }
      }
    }

    // Only create default frame types if none exist
    if (frameTypeCount === 0) {
      for (const frameType of defaultFrameTypes) {
        const { error } = await adminClient
          .from('frame_types')
          .insert({
            id: uuidv4(),
            ...frameType,
            is_active: true
          });

        if (error) {
          console.error('Error creating frame type:', error);
          return NextResponse.json(
            { error: `Failed to create frame type: ${error.message}` },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      message: 'Default product options set up successfully',
      sizes_created: sizeCount === 0 ? defaultSizes.length : 0,
      frame_types_created: frameTypeCount === 0 ? defaultFrameTypes.length : 0
    });

  } catch (error) {
    console.error('Error in setup default options API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
