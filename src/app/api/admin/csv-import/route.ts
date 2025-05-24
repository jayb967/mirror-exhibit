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
 * API endpoint for CSV import operations
 * This is a simplified endpoint that doesn't require authentication
 * It's specifically for the CSV import feature
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { operation, data } = body;

    if (!operation) {
      return NextResponse.json(
        { error: 'Operation is required' },
        { status: 400 }
      );
    }

    // Get admin client
    const adminClient = getAdminClient();

    // Process based on operation
    switch (operation) {
      case 'create_product': {
        const product = data.product;

        if (!product || !product.name) {
          return NextResponse.json(
            { error: 'Product data is required' },
            { status: 400 }
          );
        }

        // Add ID if not provided
        const productWithId = {
          id: product.id || uuidv4(),
          ...product,
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString(),
        };

        // Insert product
        const { data: insertedData, error } = await adminClient
          .from('products')
          .insert(productWithId)
          .select('id');

        if (error) {
          console.error('Error creating product:', error);
          return NextResponse.json(
            { error: `Failed to create product: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: 'Successfully created product',
          id: insertedData?.[0]?.id || productWithId.id
        });
      }

      case 'update_product': {
        const { id, ...updateData } = data.product;

        if (!id) {
          return NextResponse.json(
            { error: 'Product ID is required for updates' },
            { status: 400 }
          );
        }

        // Update product
        const { error } = await adminClient
          .from('products')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating product:', error);
          return NextResponse.json(
            { error: `Failed to update product: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: 'Successfully updated product',
          id
        });
      }

      case 'create_variation': {
        const { productId, sizeId, frameTypeId, variationData } = data;

        if (!productId || !sizeId || !frameTypeId) {
          return NextResponse.json(
            { error: 'Product ID, Size ID, and Frame Type ID are required' },
            { status: 400 }
          );
        }

        // Check if variation exists
        const { data: existingVariation } = await adminClient
          .from('product_variations')
          .select('id')
          .eq('product_id', productId)
          .eq('size_id', sizeId)
          .eq('frame_type_id', frameTypeId)
          .maybeSingle();

        if (existingVariation) {
          // Update existing variation
          // Filter out any fields that don't exist in the database schema
          const { cost, ...validVariationData } = variationData;

          const { error } = await adminClient
            .from('product_variations')
            .update(validVariationData)
            .eq('id', existingVariation.id);

          if (error) {
            console.error('Error updating variation:', error);
            return NextResponse.json(
              { error: `Failed to update variation: ${error.message}` },
              { status: 500 }
            );
          }

          return NextResponse.json({
            message: 'Successfully updated variation',
            id: existingVariation.id
          });
        } else {
          // Create new variation
          const variationId = uuidv4();

          // Filter out any fields that don't exist in the database schema
          const { cost, ...validVariationData } = variationData;

          const { error } = await adminClient
            .from('product_variations')
            .insert({
              id: variationId,
              product_id: productId,
              size_id: sizeId,
              frame_type_id: frameTypeId,
              ...validVariationData
            });

          if (error) {
            console.error('Error creating variation:', error);
            return NextResponse.json(
              { error: `Failed to create variation: ${error.message}` },
              { status: 500 }
            );
          }

          return NextResponse.json({
            message: 'Successfully created variation',
            id: variationId
          });
        }
      }

      case 'create_size': {
        const { name, description } = data;

        if (!name) {
          return NextResponse.json(
            { error: 'Size name is required' },
            { status: 400 }
          );
        }

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
        const { error } = await adminClient
          .from('product_sizes')
          .insert({
            id: sizeId,
            name,
            code: name.toLowerCase().replace(/\s+/g, '-').substring(0, 10),
            dimensions: description || `${name} dimensions`
          });

        if (error) {
          console.error('Error creating size:', error);
          return NextResponse.json(
            { error: `Failed to create size: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: 'Successfully created size',
          id: sizeId
        });
      }

      case 'create_frame_type': {
        const { name, description } = data;

        if (!name) {
          return NextResponse.json(
            { error: 'Frame type name is required' },
            { status: 400 }
          );
        }

        // Check if frame type exists
        const { data: existingFrameType } = await adminClient
          .from('frame_types')
          .select('id')
          .eq('name', name)
          .maybeSingle();

        if (existingFrameType) {
          return NextResponse.json({
            message: 'Frame type already exists',
            id: existingFrameType.id
          });
        }

        // Create new frame type
        const frameTypeId = uuidv4();
        const { error } = await adminClient
          .from('frame_types')
          .insert({
            id: frameTypeId,
            name,
            material: name.toLowerCase().replace(/\s+/g, '-').substring(0, 10),
            color: 'default',
            price_adjustment: 0
          });

        if (error) {
          console.error('Error creating frame type:', error);
          return NextResponse.json(
            { error: `Failed to create frame type: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: 'Successfully created frame type',
          id: frameTypeId
        });
      }

      case 'create_product_image': {
        const { productId, imageUrl, isPrimary = true, sortOrder = 1 } = data;

        if (!productId || !imageUrl) {
          return NextResponse.json(
            { error: 'Product ID and image URL are required' },
            { status: 400 }
          );
        }

        // Create new product image
        const imageId = uuidv4();
        const { error } = await adminClient
          .from('product_images')
          .insert({
            id: imageId,
            product_id: productId,
            image_url: imageUrl,
            is_primary: isPrimary,
            sort_order: sortOrder
          });

        if (error) {
          console.error('Error creating product image:', error);
          return NextResponse.json(
            { error: `Failed to create product image: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: 'Successfully created product image',
          id: imageId
        });
      }

      default:
        return NextResponse.json(
          { error: `Invalid operation: ${operation}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in CSV import API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
