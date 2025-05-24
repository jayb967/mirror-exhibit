'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';
import { productCompatibilityService } from './productCompatibilityService';

// Define interfaces for the CSV data structure
export interface ShopifyProductCSV {
  Handle: string;
  Title: string;
  'Body (HTML)': string;
  Vendor: string;
  'Product Category': string;
  Type: string;
  Tags: string;
  Published: string;
  'Option1 Name': string;
  'Option1 Value': string;
  'Option2 Name': string;
  'Option2 Value': string;
  'Variant SKU': string;
  'Variant Price': string;
  'Variant Compare At Price': string;
  'Image Src': string;
  'Image Position': string;
  'Image Alt Text': string;
  'Variant Weight': string;
  'Variant Weight Unit': string;
  'Cost per item': string;
  Status: string;
}

// Define interfaces for our database structure
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

export interface ProductSize {
  id: string;
  name: string;
  description?: string;
}

export interface FrameType {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  brand_id?: string;
  category_id?: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface ProductVariation {
  id: string;
  product_id: string;
  size_id: string;
  frame_type_id: string;
  sku?: string;
  stock_quantity: number;
  price: number;
  weight?: number;
  weight_unit?: string;
  // cost field has been removed as it doesn't exist in the database schema
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ImportStats {
  totalProducts: number;
  productsCreated: number;
  productsUpdated: number;
  variationsCreated: number;
  variationsUpdated: number;
  imagesProcessed: number;
  imagesUploaded: number;
  imagesFailed: number;
  categoriesCreated: number;
  errors: string[];
}

class ProductImportService {
  // Regular client for non-admin operations
  private supabase = createClientComponentClient();

  // Admin client with service role for operations that require bypassing RLS
  private getAdminClient() {
    // Create a client with the service role key for admin operations
    return createClientComponentClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      options: {
        auth: {
          persistSession: false,
        },
      },
    });
  }
  private stats: ImportStats = {
    totalProducts: 0,
    productsCreated: 0,
    productsUpdated: 0,
    variationsCreated: 0,
    variationsUpdated: 0,
    imagesProcessed: 0,
    imagesUploaded: 0,
    imagesFailed: 0,
    categoriesCreated: 0,
    errors: []
  };

  /**
   * Process a batch of Shopify CSV products
   * @param products Array of Shopify CSV product rows
   * @param onProgress Callback for progress updates
   * @returns Import statistics
   */
  async processProducts(
    products: ShopifyProductCSV[],
    onProgress: (progress: number, stats: ImportStats) => void
  ): Promise<ImportStats> {
    this.stats = {
      totalProducts: 0,
      productsCreated: 0,
      productsUpdated: 0,
      variationsCreated: 0,
      variationsUpdated: 0,
      imagesProcessed: 0,
      imagesUploaded: 0,
      imagesFailed: 0,
      categoriesCreated: 0,
      errors: []
    };

    try {
      // Group products by handle (which is our product identifier)
      const productGroups = this.groupProductsByHandle(products);
      this.stats.totalProducts = Object.keys(productGroups).length;

      // Process each product group
      let processedCount = 0;
      for (const [handle, productRows] of Object.entries(productGroups)) {
        try {
          await this.processProductGroup(handle, productRows);
        } catch (error) {
          console.error(`Error processing product ${handle}:`, error);
          this.stats.errors.push(`Error processing product ${handle}: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Update progress
        processedCount++;
        const progress = Math.round((processedCount / this.stats.totalProducts) * 100);
        onProgress(progress, { ...this.stats });
      }

      return { ...this.stats };
    } catch (error) {
      console.error('Error processing products:', error);
      this.stats.errors.push(`Error processing products: ${error instanceof Error ? error.message : String(error)}`);
      return { ...this.stats };
    }
  }

  /**
   * Group product rows by handle
   * @param products Array of Shopify CSV product rows
   * @returns Object with handles as keys and arrays of product rows as values
   */
  private groupProductsByHandle(products: ShopifyProductCSV[]): Record<string, ShopifyProductCSV[]> {
    const groups: Record<string, ShopifyProductCSV[]> = {};

    for (const product of products) {
      if (!product.Handle) continue;

      if (!groups[product.Handle]) {
        groups[product.Handle] = [];
      }

      groups[product.Handle].push(product);
    }

    return groups;
  }

  /**
   * Process a group of product rows with the same handle
   * @param handle Product handle
   * @param productRows Array of product rows with the same handle
   */
  private async processProductGroup(handle: string, productRows: ShopifyProductCSV[]): Promise<void> {
    // The first row contains the main product information
    const mainRow = productRows[0];

    if (!mainRow.Title || !mainRow['Variant Price']) {
      throw new Error(`Missing required fields for product ${handle}`);
    }

    // Check if category exists or create it
    const categoryId = await this.getOrCreateCategory(mainRow['Product Category'] || mainRow.Type);

    // Check if product already exists
    const existingProduct = await this.findProductByHandle(handle);

    let productId: string;

    if (existingProduct) {
      // Update existing product
      productId = existingProduct.id;
      await this.updateProduct(existingProduct.id, mainRow, categoryId);
      this.stats.productsUpdated++;
    } else {
      // Create new product
      productId = await this.createProduct(mainRow, categoryId);
      this.stats.productsCreated++;
    }

    // Process variations
    await this.processVariations(productId, productRows);

    // Process images
    await this.processImages(productId, productRows);
  }

  /**
   * Find a product by its handle
   * @param handle Product handle
   * @returns Product or null if not found
   */
  private async findProductByHandle(handle: string): Promise<Product | null> {
    // First try to find by meta_keywords (handle)
    const { data: dataByMetaKeywords, error: errorByMetaKeywords } = await this.supabase
      .from('products')
      .select('*')
      .eq('meta_keywords', handle)
      .single();

    if (dataByMetaKeywords) {
      return dataByMetaKeywords as Product;
    }

    // If not found, try to find by name (for backward compatibility)
    const { data: dataByName, error: errorByName } = await this.supabase
      .from('products')
      .select('*')
      .eq('name', handle)
      .single();

    if (dataByName) {
      return dataByName as Product;
    }

    return null;
  }

  /**
   * Helper function to strip HTML tags from text
   * @param html HTML text to strip
   * @returns Plain text without HTML tags
   */
  private stripHtmlTags(html: string | null | undefined): string {
    if (!html) return '';
    // Check if the content contains HTML tags
    if (/<\/?[a-z][\s\S]*>/i.test(html)) {
      // Replace HTML tags with nothing
      return html.replace(/<\/?[a-z][\s\S]*>/gi, '');
    }
    return html;
  }

  /**
   * Create a new product
   * @param productRow Product CSV row
   * @param categoryId Category ID
   * @returns Product ID
   */
  private async createProduct(productRow: ShopifyProductCSV, categoryId?: string): Promise<string> {
    const productId = uuidv4();

    // Strip HTML from description
    const cleanDescription = this.stripHtmlTags(productRow['Body (HTML)'] || '');

    const product: Product = {
      id: productId,
      name: productRow.Title,
      description: cleanDescription,
      base_price: parseFloat(productRow['Variant Price']) || 0,
      category_id: categoryId,
      is_featured: productRow.Published === 'true',
      is_active: productRow.Status === 'active',
      meta_keywords: productRow.Handle, // Store handle in meta_keywords for future reference
      meta_title: productRow.Title,
      meta_description: cleanDescription.substring(0, 200) || ''
    };

    // Get brand ID or create it
    if (productRow.Vendor) {
      const brandId = await this.getOrCreateBrand(productRow.Vendor);
      if (brandId) {
        product.brand_id = brandId;
      }
    }

    try {
      // Use admin client to bypass RLS policies
      const adminClient = this.getAdminClient();
      const { error } = await adminClient
        .from('products')
        .insert(product);

      if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error instanceof Error ? error.message : String(error)}`);
    }

    return productId;
  }

  /**
   * Update an existing product
   * @param productId Product ID
   * @param productRow Product CSV row
   * @param categoryId Category ID
   */
  private async updateProduct(productId: string, productRow: ShopifyProductCSV, categoryId?: string): Promise<void> {
    try {
      // Strip HTML from description
      const cleanDescription = this.stripHtmlTags(productRow['Body (HTML)'] || '');

      // Prepare product data for update
      const updates: Partial<Product> = {
        name: productRow.Title,
        description: cleanDescription,
        base_price: parseFloat(productRow['Variant Price']) || 0,
        category_id: categoryId,
        is_featured: productRow.Published === 'true',
        is_active: productRow.Status === 'active',
        meta_title: productRow.Title,
        meta_description: cleanDescription.substring(0, 200) || '',
        // Store handle in meta_keywords for compatibility
        meta_keywords: productRow.Handle,
        updated_at: new Date().toISOString()
      };

      // Get brand ID or create it
      if (productRow.Vendor) {
        const brandId = await this.getOrCreateBrand(productRow.Vendor);
        if (brandId) {
          updates.brand_id = brandId;
        }
      }

      // Use compatibility service to update product
      // This ensures that the update is compatible with existing product functionality
      await productCompatibilityService.updateProduct(productId, updates);
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw new Error(`Failed to update product: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get or create a category
   * @param categoryName Category name
   * @returns Category ID
   */
  private async getOrCreateCategory(categoryName: string): Promise<string | undefined> {
    if (!categoryName) return undefined;

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await this.supabase
      .from('product_categories')
      .select('id')
      .eq('name', categoryName)
      .single();

    if (existingCategory) {
      return existingCategory.id;
    }

    try {
      // Create new category using admin client to bypass RLS
      const adminClient = this.getAdminClient();
      const categoryId = uuidv4();
      const { error: insertError } = await adminClient
        .from('product_categories')
        .insert({
          id: categoryId,
          name: categoryName,
          description: `Products in the ${categoryName} category`,
        });

      if (insertError) {
        throw new Error(`Failed to create category: ${insertError.message}`);
      }

      this.stats.categoriesCreated++;
      return categoryId;
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error(`Failed to create category: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get or create a brand
   * @param brandName Brand name
   * @returns Brand ID
   */
  private async getOrCreateBrand(brandName: string): Promise<string | undefined> {
    if (!brandName) return undefined;

    // Check if brand exists
    const { data: existingBrand, error: fetchError } = await this.supabase
      .from('brands')
      .select('id')
      .eq('name', brandName)
      .single();

    if (existingBrand) {
      return existingBrand.id;
    }

    try {
      // Create new brand using admin client to bypass RLS
      const adminClient = this.getAdminClient();
      const brandId = uuidv4();
      const { error: insertError } = await adminClient
        .from('brands')
        .insert({
          id: brandId,
          name: brandName,
          description: `Products by ${brandName}`,
          is_active: true
        });

      if (insertError) {
        throw new Error(`Failed to create brand: ${insertError.message}`);
      }

      return brandId;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw new Error(`Failed to create brand: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process product variations
   * @param productId Product ID
   * @param productRows Product CSV rows
   */
  private async processVariations(productId: string, productRows: ShopifyProductCSV[]): Promise<void> {
    // If no rows have variation data, create a default variation
    const hasVariationData = productRows.some(row =>
      (row['Option1 Name'] && row['Option1 Value']) ||
      (row['Option2 Name'] && row['Option2 Value'])
    );

    if (!hasVariationData) {
      try {
        // Create default size and frame type
        const sizeId = await this.getOrCreateDefaultSize();
        const frameTypeId = await this.getOrCreateDefaultFrameType();

        if (!sizeId || !frameTypeId) {
          throw new Error('Failed to create default size or frame type');
        }

        // Create a default variation
        await this.createDefaultVariation(productId, sizeId, frameTypeId);
        this.stats.variationsCreated++;

        return; // Skip processing other variations
      } catch (error) {
        console.error('Error creating default variation:', error);
        this.stats.errors.push(`Error creating default variation: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Process each row as a variation
    for (const row of productRows) {
      try {
        // Get or create size
        const sizeId = await this.getOrCreateSize(row['Option1 Name'], row['Option1 Value']);

        // Get or create frame type
        const frameTypeId = await this.getOrCreateFrameType(row['Option2 Name'], row['Option2 Value']);

        if (!sizeId || !frameTypeId) {
          throw new Error(`Missing size or frame type for variation`);
        }

        // Check if variation exists
        const existingVariation = await this.findVariation(productId, sizeId, frameTypeId);

        if (existingVariation) {
          // Update existing variation
          await this.updateVariation(existingVariation.id, row);
          this.stats.variationsUpdated++;
        } else {
          // Create new variation
          await this.createVariation(productId, sizeId, frameTypeId, row);
          this.stats.variationsCreated++;
        }
      } catch (error) {
        console.error(`Error processing variation:`, error);
        this.stats.errors.push(`Error processing variation: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Find a product variation
   * @param productId Product ID
   * @param sizeId Size ID
   * @param frameTypeId Frame type ID
   * @returns Variation or null if not found
   */
  private async findVariation(productId: string, sizeId: string, frameTypeId: string): Promise<ProductVariation | null> {
    const { data, error } = await this.supabase
      .from('product_variations')
      .select('*')
      .eq('product_id', productId)
      .eq('size_id', sizeId)
      .eq('frame_type_id', frameTypeId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ProductVariation;
  }

  /**
   * Create a new product variation
   * @param productId Product ID
   * @param sizeId Size ID
   * @param frameTypeId Frame type ID
   * @param row Product CSV row
   * @returns Variation ID
   */
  private async createVariation(
    productId: string,
    sizeId: string,
    frameTypeId: string,
    row: ShopifyProductCSV
  ): Promise<string> {
    const variationId = uuidv4();

    const variation: ProductVariation = {
      id: variationId,
      product_id: productId,
      size_id: sizeId,
      frame_type_id: frameTypeId,
      sku: row['Variant SKU'] || undefined,
      stock_quantity: parseInt(row['Variant Inventory Qty'] || '0', 10),
      price: parseFloat(row['Variant Price']) || 0,
      weight: parseFloat(row['Variant Weight'] || '0'),
      weight_unit: row['Variant Weight Unit'] || 'lb',
      // Removed cost field as it doesn't exist in the database schema
      is_active: row.Status === 'active'
    };

    try {
      // Use admin client to bypass RLS policies
      const adminClient = this.getAdminClient();
      const { error } = await adminClient
        .from('product_variations')
        .insert(variation);

      if (error) {
        throw new Error(`Failed to create variation: ${error.message}`);
      }

      return variationId;
    } catch (error) {
      console.error('Error creating variation:', error);
      throw new Error(`Failed to create variation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update an existing product variation
   * @param variationId Variation ID
   * @param row Product CSV row
   */
  private async updateVariation(variationId: string, row: ShopifyProductCSV): Promise<void> {
    const updates: Partial<ProductVariation> = {
      sku: row['Variant SKU'] || undefined,
      stock_quantity: parseInt(row['Variant Inventory Qty'] || '0', 10),
      price: parseFloat(row['Variant Price']) || 0,
      weight: parseFloat(row['Variant Weight'] || '0'),
      weight_unit: row['Variant Weight Unit'] || 'lb',
      // Removed cost field as it doesn't exist in the database schema
      is_active: row.Status === 'active'
    };

    try {
      // Use admin client to bypass RLS policies
      const adminClient = this.getAdminClient();
      const { error } = await adminClient
        .from('product_variations')
        .update(updates)
        .eq('id', variationId);

      if (error) {
        throw new Error(`Failed to update variation: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating variation:', error);
      throw new Error(`Failed to update variation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get or create a size
   * @param optionName Option name (e.g., "Size")
   * @param optionValue Option value (e.g., "Small - 12" x 12"")
   * @returns Size ID
   */
  private async getOrCreateSize(optionName: string, optionValue: string): Promise<string | undefined> {
    if (!optionName || !optionValue || optionName !== 'Size') return undefined;

    // Check if size exists
    const { data: existingSize, error: fetchError } = await this.supabase
      .from('product_sizes')
      .select('id')
      .eq('name', optionValue)
      .single();

    if (existingSize) {
      return existingSize.id;
    }

    try {
      // Create new size using admin client to bypass RLS
      const adminClient = this.getAdminClient();
      const sizeId = uuidv4();
      const { error: insertError } = await adminClient
        .from('product_sizes')
        .insert({
          id: sizeId,
          name: optionValue,
          code: optionValue.toLowerCase().replace(/\s+/g, '-').substring(0, 10),
          dimensions: `${optionValue} dimensions`,
          price_adjustment: 0
        });

      if (insertError) {
        throw new Error(`Failed to create size: ${insertError.message}`);
      }

      return sizeId;
    } catch (error) {
      console.error('Error creating size:', error);
      throw new Error(`Failed to create size: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get or create a frame type
   * @param optionName Option name (e.g., "Frame")
   * @param optionValue Option value (e.g., "Metal")
   * @returns Frame type ID
   */
  private async getOrCreateFrameType(optionName: string, optionValue: string): Promise<string | undefined> {
    if (!optionName || !optionValue || optionName !== 'Frame') return undefined;

    // Check if frame type exists
    const { data: existingFrameType, error: fetchError } = await this.supabase
      .from('frame_types')
      .select('id')
      .eq('name', optionValue)
      .single();

    if (existingFrameType) {
      return existingFrameType.id;
    }

    try {
      // Create new frame type using admin client to bypass RLS
      const adminClient = this.getAdminClient();
      const frameTypeId = uuidv4();
      const { error: insertError } = await adminClient
        .from('frame_types')
        .insert({
          id: frameTypeId,
          name: optionValue,
          material: optionValue.toLowerCase().replace(/\s+/g, '-').substring(0, 10),
          color: 'default',
          price_adjustment: 0
        });

      if (insertError) {
        throw new Error(`Failed to create frame type: ${insertError.message}`);
      }

      return frameTypeId;
    } catch (error) {
      console.error('Error creating frame type:', error);
      throw new Error(`Failed to create frame type: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get or create a default size
   * @returns Default size ID
   */
  private async getOrCreateDefaultSize(): Promise<string> {
    const defaultSizeName = 'Default Size';

    // Check if default size exists
    const { data: existingSize, error: fetchError } = await this.supabase
      .from('product_sizes')
      .select('id')
      .eq('name', defaultSizeName)
      .single();

    if (existingSize) {
      return existingSize.id;
    }

    try {
      // Create default size using admin client to bypass RLS
      const adminClient = this.getAdminClient();
      const sizeId = uuidv4();
      const { error: insertError } = await adminClient
        .from('product_sizes')
        .insert({
          id: sizeId,
          name: defaultSizeName,
          code: 'default',
          dimensions: 'Default size dimensions',
          price_adjustment: 0
        });

      if (insertError) {
        throw new Error(`Failed to create default size: ${insertError.message}`);
      }

      return sizeId;
    } catch (error) {
      console.error('Error creating default size:', error);
      throw new Error(`Failed to create default size: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get or create a default frame type
   * @returns Default frame type ID
   */
  private async getOrCreateDefaultFrameType(): Promise<string> {
    const defaultFrameName = 'Default Frame';

    // Check if default frame type exists
    const { data: existingFrameType, error: fetchError } = await this.supabase
      .from('frame_types')
      .select('id')
      .eq('name', defaultFrameName)
      .single();

    if (existingFrameType) {
      return existingFrameType.id;
    }

    try {
      // Create default frame type using admin client to bypass RLS
      const adminClient = this.getAdminClient();
      const frameTypeId = uuidv4();
      const { error: insertError } = await adminClient
        .from('frame_types')
        .insert({
          id: frameTypeId,
          name: defaultFrameName,
          material: 'default',
          color: 'default',
          price_adjustment: 0
        });

      if (insertError) {
        throw new Error(`Failed to create default frame type: ${insertError.message}`);
      }

      return frameTypeId;
    } catch (error) {
      console.error('Error creating default frame type:', error);
      throw new Error(`Failed to create default frame type: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a default variation for a product
   * @param productId Product ID
   * @param sizeId Size ID
   * @param frameTypeId Frame type ID
   * @returns Variation ID
   */
  private async createDefaultVariation(productId: string, sizeId: string, frameTypeId: string): Promise<string> {
    const variationId = uuidv4();

    // Get product base price
    const { data: product, error: productError } = await this.supabase
      .from('products')
      .select('base_price')
      .eq('id', productId)
      .single();

    if (productError) {
      throw new Error(`Failed to get product: ${productError.message}`);
    }

    // Create variation with only fields that exist in the database schema
    const variation: ProductVariation = {
      id: variationId,
      product_id: productId,
      size_id: sizeId,
      frame_type_id: frameTypeId,
      sku: `${productId.substring(0, 8)}-default`,
      stock_quantity: 10,
      price: product?.base_price || 0,
      weight: 0,
      weight_unit: 'lb',
      is_active: true
    };

    try {
      // Use admin client to bypass RLS policies
      const adminClient = this.getAdminClient();
      const { error } = await adminClient
        .from('product_variations')
        .insert(variation);

      if (error) {
        throw new Error(`Failed to create default variation: ${error.message}`);
      }

      return variationId;
    } catch (error) {
      console.error('Error creating default variation:', error);
      throw new Error(`Failed to create default variation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Process product images
   * @param productId Product ID
   * @param productRows Product CSV rows
   */
  private async processImages(productId: string, productRows: ShopifyProductCSV[]): Promise<void> {
    // Get existing images for this product
    const { data: existingImages } = await this.supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId);

    const existingUrls = new Set((existingImages || []).map(img => img.image_url));

    // Process images in batches of 5 to avoid overwhelming the server
    const imagesToProcess = productRows
      .filter(row => row['Image Src'] && !existingUrls.has(row['Image Src']))
      .map(row => ({
        url: row['Image Src'],
        position: parseInt(row['Image Position'] || '1', 10),
        altText: row['Image Alt Text'] || ''
      }));

    this.stats.imagesProcessed += imagesToProcess.length;

    // Process images in batches of 5
    const batchSize = 5;
    for (let i = 0; i < imagesToProcess.length; i += batchSize) {
      const batch = imagesToProcess.slice(i, i + batchSize);
      await Promise.all(batch.map(img => this.processImage(productId, img.url, img.position, img.altText)));
    }

    // Update main product image if needed
    const mainImage = productRows.find(row => row['Image Position'] === '1')?.['Image Src'];
    if (mainImage) {
      await this.updateProductMainImage(productId, mainImage);
    }
  }

  /**
   * Process a single image
   * @param productId Product ID
   * @param imageUrl Image URL
   * @param position Image position
   * @param altText Image alt text
   */
  private async processImage(
    productId: string,
    imageUrl: string,
    position: number,
    altText: string
  ): Promise<void> {
    try {
      // Upload image to Cloudinary
      const cloudinaryUrl = await this.uploadImageToCloudinary(imageUrl);

      if (!cloudinaryUrl) {
        this.stats.imagesFailed++;
        return;
      }

      this.stats.imagesUploaded++;

      // Save image to database using admin client to bypass RLS
      const adminClient = this.getAdminClient();
      const imageId = uuidv4();
      const { error } = await adminClient
        .from('product_images')
        .insert({
          id: imageId,
          product_id: productId,
          image_url: cloudinaryUrl,
          is_primary: position === 1,
          sort_order: position
        });

      if (error) {
        throw new Error(`Failed to save image: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error processing image:`, error);
      this.stats.errors.push(`Error processing image: ${error instanceof Error ? error.message : String(error)}`);
      this.stats.imagesFailed++;
    }
  }

  /**
   * Upload an image to Cloudinary
   * @param imageUrl Image URL
   * @returns Cloudinary URL or null if upload failed
   */
  private async uploadImageToCloudinary(imageUrl: string): Promise<string | null> {
    try {
      // Skip if already a Cloudinary URL
      if (imageUrl.includes('res.cloudinary.com')) {
        return imageUrl;
      }

      // Upload to Cloudinary
      const response = await fetch('/api/cloudinary/upload-from-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image from URL');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return null;
    }
  }

  /**
   * Update the main image of a product
   * @param productId Product ID
   * @param imageUrl Image URL
   */
  private async updateProductMainImage(productId: string, imageUrl: string): Promise<void> {
    try {
      // Check if image is already uploaded to Cloudinary
      let cloudinaryUrl = imageUrl;
      if (!imageUrl.includes('res.cloudinary.com')) {
        cloudinaryUrl = await this.uploadImageToCloudinary(imageUrl) || imageUrl;
      }

      // Update product image_url using admin client to bypass RLS
      const adminClient = this.getAdminClient();
      const { error } = await adminClient
        .from('products')
        .update({ image_url: cloudinaryUrl })
        .eq('id', productId);

      if (error) {
        throw new Error(`Failed to update product main image: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error updating product main image:`, error);
      this.stats.errors.push(`Error updating product main image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const productImportService = new ProductImportService();
