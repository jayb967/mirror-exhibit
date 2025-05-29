'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * ProductCompatibilityService
 *
 * This service provides compatibility functions to ensure that products imported
 * through the Shopify CSV import process work correctly with existing product
 * display, ordering, and editing functionality.
 */
class ProductCompatibilityService {
  // Create a Supabase client with service role for admin operations
  private getSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  /**
   * Normalize product data to ensure compatibility with existing product display
   * @param product Raw product data from database
   * @returns Normalized product data
   */
  normalizeProductData(product: any): any {
    if (!product) return null;

    // Ensure all expected fields exist
    const normalizedProduct = {
      ...product,
      // If title doesn't exist but name does, use name as title
      title: product.title || product.name || '',
      // If name doesn't exist but title does, use title as name
      name: product.name || product.title || '',
      // Ensure description exists
      description: product.description || '',
      // Ensure price exists and is a number
      price: typeof product.price === 'number' ? product.price :
             typeof product.base_price === 'number' ? product.base_price : 0,
      // Ensure image_url exists
      image_url: product.image_url || product.image || '',
      // Ensure category_id exists
      category_id: product.category_id || null,
      // Ensure is_active exists
      is_active: typeof product.is_active === 'boolean' ? product.is_active : true,
      // Extract handle from meta_keywords if it exists
      handle: product.handle || product.meta_keywords || '',
      // Ensure variations array exists
      variations: product.variations || [],
      // Ensure images array exists
      images: product.images || []
    };

    return normalizedProduct;
  }

  /**
   * Get product by ID with all related data
   * @param productId Product ID
   * @returns Product with variations, images, category, and brand
   */
  async getProductById(productId: string): Promise<any> {
    try {
      const supabase = this.getSupabaseClient();
      // Get product
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*),
          brand:brands(*),
          variations:product_variations(
            *,
            size:product_sizes(*),
            frame_type:frame_types(*)
          ),
          images:product_images(*)
        `)
        .eq('id', productId)
        .single();

      if (error || !product) {
        console.error('Error fetching product:', error);
        return null;
      }

      // Normalize product data
      return this.normalizeProductData(product);
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  }

  /**
   * Get products with pagination and filtering
   * @param options Query options
   * @returns Products with pagination info
   */
  async getProducts(options: {
    page?: number;
    limit?: number;
    category_id?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    is_active?: boolean;
  }): Promise<{ data: any[]; count: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        category_id,
        search,
        sort_by = 'created_at',
        sort_order = 'desc',
        is_active
      } = options;

      // Calculate offset
      const offset = (page - 1) * limit;

      const supabase = this.getSupabaseClient();
      // Build query
      let query = supabase
        .from('products')
        .select(`
          *,
          category:product_categories(id, name),
          brand:brands(id, name),
          variations:product_variations(
            id, price, stock_quantity,
            size:product_sizes(id, name),
            frame_type:frame_types(id, name)
          ),
          images:product_images(id, image_url, is_primary)
        `, { count: 'exact' });

      // Apply filters
      if (category_id) {
        query = query.eq('category_id', category_id);
      }

      if (typeof is_active === 'boolean') {
        query = query.eq('is_active', is_active);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,meta_keywords.ilike.%${search}%`);
      }

      // Apply sorting
      if (sort_by && sort_order) {
        query = query.order(sort_by, { ascending: sort_order === 'asc' });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return { data: [], count: 0 };
      }

      // Normalize product data
      const normalizedData = data.map(product => this.normalizeProductData(product));

      return {
        data: normalizedData,
        count: count || 0
      };
    } catch (error) {
      console.error('Error in getProducts:', error);
      return { data: [], count: 0 };
    }
  }

  /**
   * Update product data
   * @param productId Product ID
   * @param productData Product data to update
   * @returns Updated product
   */
  async updateProduct(productId: string, productData: any): Promise<any> {
    try {
      // Extract main product data
      const {
        name,
        title,
        description,
        price,
        base_price,
        category_id,
        brand_id,
        is_active,
        is_featured,
        meta_title,
        meta_description,
        meta_keywords,
        handle,
        variations,
        images
      } = productData;

      // Prepare product update data
      const productUpdate: any = {
        name: name || title,
        description,
        category_id,
        brand_id,
        is_active,
        is_featured,
        meta_title,
        meta_description,
        updated_at: new Date().toISOString()
      };

      // Handle price field compatibility
      if (typeof price === 'number') {
        productUpdate.base_price = price;
      } else if (typeof base_price === 'number') {
        productUpdate.base_price = base_price;
      }

      // Handle handle/meta_keywords compatibility
      if (handle && !meta_keywords) {
        productUpdate.meta_keywords = handle;
      } else if (meta_keywords) {
        productUpdate.meta_keywords = meta_keywords;
      }

      const supabase = this.getSupabaseClient();
      // Update product
      const { error } = await supabase
        .from('products')
        .update(productUpdate)
        .eq('id', productId);

      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }

      // Handle variations and images updates if provided
      if (variations) {
        await this.updateProductVariations(productId, variations);
      }

      if (images) {
        await this.updateProductImages(productId, images);
      }

      // Get updated product with all related data
      return this.getProductById(productId);
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error;
    }
  }

  /**
   * Update product variations
   * @param productId Product ID
   * @param variations Variations to update
   */
  private async updateProductVariations(productId: string, variations: any[]): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      // Get existing variations
      const { data: existingVariations, error: fetchError } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId);

      if (fetchError) {
        console.error('Error fetching existing variations:', fetchError);
        throw fetchError;
      }

      // Create a map of existing variations for quick lookup
      const existingVariationMap = new Map();
      existingVariations?.forEach(variation => {
        const key = `${variation.size_id}-${variation.frame_type_id}`;
        existingVariationMap.set(key, variation);
      });

      // Process each variation
      for (const variation of variations) {
        // Skip if missing required fields
        if (!variation.size_id || !variation.frame_type_id) {
          console.warn('Skipping variation update due to missing size_id or frame_type_id');
          continue;
        }

        const key = `${variation.size_id}-${variation.frame_type_id}`;
        const existingVariation = existingVariationMap.get(key);

        if (existingVariation) {
          // Update existing variation with only fields known to exist in the schema
          const updateData: any = {
            // Required fields that always exist
            price: variation.price || existingVariation.price,
            stock_quantity: variation.stock_quantity !== undefined ? variation.stock_quantity : existingVariation.stock_quantity,
            sku: variation.sku || existingVariation.sku,
            is_active: variation.is_active !== undefined ? variation.is_active : existingVariation.is_active,
            updated_at: new Date().toISOString()
          };

          // Only include optional fields if they exist in the source data
          if (variation.weight !== undefined || existingVariation.weight !== undefined) {
            updateData.weight = variation.weight || existingVariation.weight;
          }

          if (variation.weight_unit || existingVariation.weight_unit) {
            updateData.weight_unit = variation.weight_unit || existingVariation.weight_unit;
          }

          const { error: updateError } = await supabase
            .from('product_variations')
            .update(updateData)
            .eq('id', existingVariation.id);

          if (updateError) {
            console.error('Error updating variation:', updateError);
          }
        } else {
          // Create new variation with only fields known to exist in the schema
          const insertData: any = {
            // Required fields that always exist
            product_id: productId,
            size_id: variation.size_id,
            frame_type_id: variation.frame_type_id,
            price: variation.price || 0,
            stock_quantity: variation.stock_quantity || 0,
            sku: variation.sku,
            is_active: variation.is_active !== undefined ? variation.is_active : true
          };

          // Only include optional fields if they exist in the source data
          if (variation.weight !== undefined) {
            insertData.weight = variation.weight;
          }

          if (variation.weight_unit) {
            insertData.weight_unit = variation.weight_unit;
          } else {
            insertData.weight_unit = 'lb'; // Default value
          }

          const { error: insertError } = await supabase
            .from('product_variations')
            .insert(insertData);

          if (insertError) {
            console.error('Error creating variation:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Error in updateProductVariations:', error);
      throw error;
    }
  }

  /**
   * Update product images
   * @param productId Product ID
   * @param images Images to update
   */
  private async updateProductImages(productId: string, images: any[]): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      // Get existing images
      const { data: existingImages, error: fetchError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId);

      if (fetchError) {
        console.error('Error fetching existing images:', fetchError);
        throw fetchError;
      }

      // Create a map of existing images for quick lookup
      const existingImageMap = new Map();
      existingImages?.forEach(image => {
        existingImageMap.set(image.image_url, image);
      });

      // Process each image
      for (const image of images) {
        // Skip if missing required fields
        if (!image.image_url) {
          console.warn('Skipping image update due to missing image_url');
          continue;
        }

        const existingImage = existingImageMap.get(image.image_url);

        if (existingImage) {
          // Update existing image
          const { error: updateError } = await supabase
            .from('product_images')
            .update({
              is_primary: image.is_primary !== undefined ? image.is_primary : existingImage.is_primary,
              sort_order: image.sort_order !== undefined ? image.sort_order : existingImage.sort_order,
              alt_text: image.alt_text || existingImage.alt_text,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingImage.id);

          if (updateError) {
            console.error('Error updating image:', updateError);
          }
        } else {
          // Create new image
          const { error: insertError } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              image_url: image.image_url,
              is_primary: image.is_primary !== undefined ? image.is_primary : false,
              sort_order: image.sort_order !== undefined ? image.sort_order : 0,
              alt_text: image.alt_text
            });

          if (insertError) {
            console.error('Error creating image:', insertError);
          }
        }
      }

      // Update main product image if there's a primary image
      const primaryImage = images.find(img => img.is_primary);
      if (primaryImage && primaryImage.image_url) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: primaryImage.image_url })
          .eq('id', productId);

        if (updateError) {
          console.error('Error updating product main image:', updateError);
        }
      }
    } catch (error) {
      console.error('Error in updateProductImages:', error);
      throw error;
    }
  }
}

export const productCompatibilityService = new ProductCompatibilityService();
