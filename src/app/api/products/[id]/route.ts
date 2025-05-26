// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/utils/clerk-supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const supabase = createPublicSupabaseClient();

    // Fetch the product with brand and category data - fix relationship ambiguity
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        base_price,
        cost,
        discount_price,
        image_url,
        is_featured,
        is_active,
        meta_title,
        meta_description,
        meta_keywords,
        created_at,
        updated_at,
        brand_id,
        category_id,
        brands!fk_products_brand_id(id, name, slug, logo_url, website_url),
        product_categories(id, name)
      `)
      .eq('id', id)
      .single();

    // Fetch additional data separately for better control
    let variations = [];
    let images = [];
    let tags = [];

    if (!error && data) {
      // Fetch variations
      const { data: variationsData } = await supabase
        .from('product_variations')
        .select(`
          *,
          size:product_sizes(*),
          frame_type:frame_types(*)
        `)
        .eq('product_id', id);

      variations = variationsData || [];

      // Fetch images
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('sort_order');

      images = imagesData || [];

      // Fetch tags
      const { data: tagsData } = await supabase
        .from('product_tags')
        .select(`
          tags(id, name, slug, color, category)
        `)
        .eq('product_id', id);

      tags = tagsData?.map(pt => pt.tags).filter(Boolean) || [];
    }

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json(
        { error: 'Error loading product' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform the data to match the expected format
    const transformedData = {
      success: true,
      product: {
        id: data.id,
        name: data.name,
        title: data.name, // For compatibility
        description: data.description,
        base_price: data.base_price,
        cost: data.cost,
        discount_price: data.discount_price,
        price: data.discount_price || data.base_price, // Display price
        image_url: data.image_url,
        image: data.image_url || '/assets/img/logo/ME_Logo.png', // Fallback to your logo
        is_featured: data.is_featured || false,
        is_active: data.is_active,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords,
        created_at: data.created_at,
        updated_at: data.updated_at,

        // Brand data
        brand: data.brands?.name || 'Mirror Exhibit',
        brandData: data.brands || null,

        // Category data
        category: data.product_categories?.name || 'Uncategorized',
        categoryData: data.product_categories || null,

        // Tags data
        tags: tags || [],

        // Images and variations
        variations: variations,
        product_images: images,
        images: images, // For compatibility
        primaryImage: images.find(img => img.is_primary) || images[0] || null,

        // Generate handle for URL
        handle: data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || data.id
      }
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in product API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
