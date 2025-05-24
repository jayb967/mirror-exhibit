import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { getAdminClient } from '@/utils/supabase/admin';

/**
 * API endpoint to create product variations for existing products
 * This is a one-time setup endpoint that should be called by an admin
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createRouteHandlerClient({ cookies });
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

    // Fetch all products
    const { data: products, error: productsError } = await adminClient
      .from('products')
      .select('id, base_price')
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: `Failed to fetch products: ${productsError.message}` },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'No active products found' },
        { status: 404 }
      );
    }

    // Fetch all sizes
    const { data: sizes, error: sizesError } = await adminClient
      .from('product_sizes')
      .select('id, price_adjustment');

    if (sizesError) {
      console.error('Error fetching sizes:', sizesError);
      return NextResponse.json(
        { error: `Failed to fetch sizes: ${sizesError.message}` },
        { status: 500 }
      );
    }

    if (!sizes || sizes.length === 0) {
      return NextResponse.json(
        { error: 'No sizes found. Please set up default options first.' },
        { status: 404 }
      );
    }

    // Fetch all frame types
    const { data: frameTypes, error: frameTypesError } = await adminClient
      .from('frame_types')
      .select('id, price_adjustment');

    if (frameTypesError) {
      console.error('Error fetching frame types:', frameTypesError);
      return NextResponse.json(
        { error: `Failed to fetch frame types: ${frameTypesError.message}` },
        { status: 500 }
      );
    }

    if (!frameTypes || frameTypes.length === 0) {
      return NextResponse.json(
        { error: 'No frame types found. Please set up default options first.' },
        { status: 404 }
      );
    }

    // Create variations for each product with all size and frame type combinations
    const variationsToCreate = [];
    let variationsCreated = 0;

    for (const product of products) {
      for (const size of sizes) {
        for (const frameType of frameTypes) {
          // Check if variation already exists
          const { data: existingVariation } = await adminClient
            .from('product_variations')
            .select('id')
            .eq('product_id', product.id)
            .eq('size_id', size.id)
            .eq('frame_type_id', frameType.id)
            .maybeSingle();

          if (!existingVariation) {
            // Calculate price based on base price and adjustments
            const price = product.base_price +
              (size.price_adjustment || 0) +
              (frameType.price_adjustment || 0);

            // Generate a simple SKU
            const sku = `PROD-${product.id.substring(0, 4)}-${size.id.substring(0, 4)}-${frameType.id.substring(0, 4)}`;

            variationsToCreate.push({
              id: uuidv4(),
              product_id: product.id,
              size_id: size.id,
              frame_type_id: frameType.id,
              sku,
              stock_quantity: 10, // Default stock quantity
              price,
              is_active: true
            });

            variationsCreated++;
          }
        }
      }
    }

    // Insert variations in batches to avoid hitting request size limits
    const batchSize = 50;
    for (let i = 0; i < variationsToCreate.length; i += batchSize) {
      const batch = variationsToCreate.slice(i, i + batchSize);

      if (batch.length > 0) {
        const { error: insertError } = await adminClient
          .from('product_variations')
          .insert(batch);

        if (insertError) {
          console.error('Error creating variations batch:', insertError);
          return NextResponse.json(
            { error: `Failed to create variations: ${insertError.message}` },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      message: 'Product variations created successfully',
      variations_created: variationsCreated,
      products_processed: products.length
    });

  } catch (error) {
    console.error('Error in create product variations API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
