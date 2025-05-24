// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/utils/clerk-supabase';

/**
 * API endpoint to fetch product options (sizes and frame types)
 * This is used to pre-load options for the product modal
 */
export async function GET() {
  try {
    // Create a public Supabase client for public product options access
    const supabase = createPublicSupabaseClient();

    // Fetch sizes
    const { data: sizes, error: sizesError } = await supabase
      .from('product_sizes')
      .select('id, name, dimensions, code, price_adjustment')
      .eq('is_active', true)
      .order('name');

    if (sizesError) {
      console.error('Error fetching sizes:', sizesError);
      return NextResponse.json(
        { error: 'Error fetching sizes' },
        { status: 500 }
      );
    }

    // Fetch frame types
    const { data: frameTypes, error: frameTypesError } = await supabase
      .from('frame_types')
      .select('id, name, material, color, description, price_adjustment')
      .eq('is_active', true)
      .order('name');

    if (frameTypesError) {
      console.error('Error fetching frame types:', frameTypesError);
      return NextResponse.json(
        { error: 'Error fetching frame types' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sizes: sizes || [],
      frameTypes: frameTypes || []
    });

  } catch (error) {
    console.error('Error in product options API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
