'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { FaFileUpload, FaCloudUploadAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import crypto from 'crypto';

// Define the type for CSV product data
interface CSVProduct {
  [key: string]: any;
  name?: string;
  description?: string;
  price?: string | number;
  stock_quantity?: string | number;
  category?: string;
  image_url?: string;
  dimensions?: string;
  material?: string;
  is_featured?: string;
  // Internal fields
  _id?: string; // Added to store the product ID after creation
  _isShopifyProduct?: boolean;
  _variations?: CSVProduct[];
  // Shopify specific fields
  Handle?: string;
  Title?: string;
  'Body (HTML)'?: string;
  'Variant Price'?: string;
  'Variant Inventory Qty'?: string;
  Type?: string;
  'Image Src'?: string;
  Published?: string;
  'Option1 Name'?: string;
  'Option1 Value'?: string;
  'Option2 Name'?: string;
  'Option2 Value'?: string;
  'Variant SKU'?: string;
  'Variant Weight'?: string;
  'Variant Weight Unit'?: string;
  'Cost per item'?: string;
  Status?: string;
}

// Define database field mapping
interface FieldMapping {
  csvField: string;
  dbField: string;
}

// Define available database fields
const availableDatabaseFields = [
  { value: 'name', label: 'Name' },
  { value: 'description', label: 'Description' },
  { value: 'base_price', label: 'Price' },
  { value: 'type', label: 'Category/Type' },
  { value: 'image_url', label: 'Image URL' },
  { value: 'is_featured', label: 'Is Featured' },
];

export default function ImportProductsPage() {
  const supabase = createClientComponentClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<'parsing' | 'mapping-headers' | 'uploading-images' | 'saving-products' | 'complete'>('parsing');
  const [stats, setStats] = useState({
    processed: 0,
    successful: 0,
    failed: 0,
    imagesProcessed: 0,
    imagesUploaded: 0,
    imagesFailed: 0
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Header mapping state
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [parsedProducts, setParsedProducts] = useState<CSVProduct[]>([]);

  /**
   * Process product variations for a Shopify product
   * @param productId The ID of the product
   * @param product The product data with variations
   */
  const processProductVariations = async (productId: string, product: CSVProduct) => {
    // Skip if not a Shopify product
    if (!product._isShopifyProduct) return;

    console.log('Processing variations for product:', productId);

    // Map option names to expected values (Size and Frame)
    const mapOptionName = (name?: string): string => {
      if (!name) return '';

      // Common mappings for size-related options
      if (/size|dimension|width|height|length/i.test(name)) {
        return 'Size';
      }

      // Common mappings for frame-related options
      if (/frame|material|finish|color|style/i.test(name)) {
        return 'Frame';
      }

      return name;
    };

    // Process the main product as a variation
    if (product['Option1 Name'] && product['Option1 Value']) {
      const mappedOption1Name = mapOptionName(product['Option1 Name']);
      const mappedOption2Name = mapOptionName(product['Option2 Name']);

      console.log(`Main product variation: ${mappedOption1Name}=${product['Option1 Value']}, ${mappedOption2Name}=${product['Option2 Value']}`);

      await createOrUpdateVariation(
        productId,
        mappedOption1Name,
        product['Option1 Value'],
        mappedOption2Name,
        product['Option2 Value'],
        product
      );
    } else {
      // If no options are specified, create a default variation
      console.log('Creating default variation for product');
      await createOrUpdateVariation(
        productId,
        'Size',
        'Default Size',
        'Frame',
        'Default Frame',
        product
      );
    }

    // Process additional variations
    if (product._variations && Array.isArray(product._variations)) {
      console.log(`Processing ${product._variations.length} additional variations`);

      for (const variation of product._variations) {
        if (variation['Option1 Name'] && variation['Option1 Value']) {
          const mappedOption1Name = mapOptionName(variation['Option1 Name']);
          const mappedOption2Name = mapOptionName(variation['Option2 Name']);

          console.log(`Variation: ${mappedOption1Name}=${variation['Option1 Value']}, ${mappedOption2Name}=${variation['Option2 Value']}`);

          await createOrUpdateVariation(
            productId,
            mappedOption1Name,
            variation['Option1 Value'],
            mappedOption2Name,
            variation['Option2 Value'],
            variation
          );
        }
      }
    }
  };

  /**
   * Create or update a product variation
   */
  const createOrUpdateVariation = async (
    productId: string,
    option1Name: string,
    option1Value: string,
    option2Name?: string,
    option2Value?: string,
    data?: any
  ) => {
    try {

      // Get or create size
      let sizeId: string | null = null;
      if (option1Name === 'Size' && option1Value) {
        try {
          // Use the simplified CSV import API
          const response = await fetch('/api/admin/csv-import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              operation: 'create_size',
              data: {
                name: option1Value,
                code: option1Value.toLowerCase().replace(/\s+/g, '-').substring(0, 10),
                dimensions: `${option1Value} dimensions`
              }
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating size:', errorData.error);
            return;
          }

          const result = await response.json();
          sizeId = result.id;
        } catch (error) {
          console.error('Error in size API call:', error);
          return;
        }
      }

      // Get or create frame type
      let frameTypeId: string | null = null;
      if (option2Name === 'Frame' && option2Value) {
        try {
          // Use the simplified CSV import API
          const response = await fetch('/api/admin/csv-import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              operation: 'create_frame_type',
              data: {
                name: option2Value,
                material: option2Value.toLowerCase().replace(/\s+/g, '-').substring(0, 10),
                color: 'default'
              }
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating frame type:', errorData.error);
            return;
          }

          const result = await response.json();
          frameTypeId = result.id;
        } catch (error) {
          console.error('Error in frame type API call:', error);
          return;
        }
      }

      // Create default size and frame type if needed
      if (!sizeId) {
        console.log('Creating default size for variation');
        try {
          // Use the simplified CSV import API
          const response = await fetch('/api/admin/csv-import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              operation: 'create_size',
              data: {
                name: 'Default Size',
                code: 'default',
                dimensions: 'Default size dimensions'
              }
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating default size:', errorData.error);
            return;
          }

          const result = await response.json();
          sizeId = result.id;
        } catch (error) {
          console.error('Error in default size API call:', error);
          return;
        }
      }

      if (!frameTypeId) {
        console.log('Creating default frame type for variation');
        try {
          // Use the simplified CSV import API
          const response = await fetch('/api/admin/csv-import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              operation: 'create_frame_type',
              data: {
                name: 'Default Frame',
                material: 'default',
                color: 'default'
              }
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating default frame type:', errorData.error);
            return;
          }

          const result = await response.json();
          frameTypeId = result.id;
        } catch (error) {
          console.error('Error in default frame type API call:', error);
          return;
        }
      }

      // Prepare variation data - match exactly with the ProductVariation interface
      const variationData = {
        sku: data?.['Variant SKU'] || `${option1Value.substring(0, 3)}-${option2Value ? option2Value.substring(0, 3) : 'STD'}`,
        stock_quantity: parseInt(data?.['Variant Inventory Qty'] || '10', 10),
        price: parseFloat(data?.['Variant Price'] || data?.price || data?.base_price || '0'),
        weight: parseFloat(data?.['Variant Weight'] || '0'),
        weight_unit: data?.['Variant Weight Unit'] || 'lb',
        // Removed 'cost' field as it doesn't exist in the database schema
        is_active: data?.Status === 'active' || true
      };

      try {
        // Use the simplified CSV import API
        const response = await fetch('/api/admin/csv-import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'create_variation',
            data: {
              productId,
              sizeId,
              frameTypeId,
              variationData
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error creating/updating variation:', errorData.error);
          console.error('Variation data:', variationData);
        } else {
          const result = await response.json();
          console.log('Successfully created/updated variation:', result.id);
        }
      } catch (error) {
        console.error('Error in variation API call:', error);
      }
    } catch (error) {
      console.error('Error processing variation:', error);
    }
  };

  /**
   * Upload an image from a URL to Cloudinary
   * @param url The URL of the image to upload
   * @returns The Cloudinary URL of the uploaded image
   */
  const uploadImageFromUrl = async (url: string, retries = 3): Promise<string | null> => {
    try {
      // Skip if URL is empty or null
      if (!url) {
        console.warn('Empty image URL provided, skipping upload');
        return null;
      }

      // Skip if already a Cloudinary URL
      if (url.includes('res.cloudinary.com')) {
        console.log('Image is already on Cloudinary, skipping upload');
        return url;
      }

      // Use the direct upload endpoint for CSV imports
      // This endpoint doesn't require authentication
      const response = await fetch('/api/cloudinary/direct-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to upload image: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Upload error details:', errorData);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);

      // Retry logic
      if (retries > 0) {
        console.log(`Retrying image upload, ${retries} attempts remaining`);
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return uploadImageFromUrl(url, retries - 1);
      }

      return null;
    }
  };

  /**
   * Handle CSV file upload
   * @param e The file input change event
   */
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStats({
      processed: 0,
      successful: 0,
      failed: 0,
      imagesProcessed: 0,
      imagesUploaded: 0,
      imagesFailed: 0
    });
    setErrors([]);
    setProcessingStep('parsing');
    setProgress(0);

    // Reset the file input to allow re-uploading the same file
    if (e.target) {
      e.target.value = '';
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true, // Skip empty lines in the CSV
      complete: async (results) => {
        try {
          // Log the parsed results for debugging
          console.log('CSV Parse Results:', results);
          console.log('Headers:', results.meta.fields);
          console.log('First row:', results.data[0]);

          let products = results.data as CSVProduct[];

          // Check if we have any data
          if (!products || products.length === 0) {
            throw new Error('No data found in CSV file. Please check the file format.');
          }

          // Get available headers
          const availableHeaders = results.meta.fields || [];

          // Store the CSV headers for mapping
          setCsvHeaders(availableHeaders);
          setParsedProducts(products);

          // Check if this is a Shopify CSV file and map headers if needed
          const isShopifyFormat = availableHeaders.includes('Handle') &&
            (availableHeaders.includes('Title') || availableHeaders.includes('Variant Price'));

          if (isShopifyFormat) {
            console.log('Detected Shopify CSV format. Converting to standard format...');

            // Pre-process Shopify CSV to handle multiple rows per product
            // Group products by Handle for display purposes, but keep all rows for variation handling
            const productsByHandle: { [key: string]: CSVProduct[] } = {};

            // First pass: Group products by Handle
            products.forEach(product => {
              if (!product.Handle) return;

              const handle = product.Handle;

              if (!productsByHandle[handle]) {
                productsByHandle[handle] = [];
              }

              productsByHandle[handle].push(product);
            });

            // For display in the UI, we'll use the first row with a Title as the main product data
            // but we'll keep all rows for processing variations later
            const displayProducts = Object.entries(productsByHandle).map(([handle, rows]) => {
              // Find the first row with a Title, or use the first row
              const mainRow = rows.find(row => row.Title && row.Title.trim() !== '') || rows[0];

              // Add a special property to indicate this is a product with variations
              const enhancedProduct = {
                ...mainRow,
                _variations: rows.length > 1 ? rows.filter(r => r !== mainRow) : [],
                _isShopifyProduct: true
              };

              return enhancedProduct;
            });

            console.log(`Processed ${products.length} rows into ${displayProducts.length} unique products by Handle`);

            // Update the parsed products
            setParsedProducts(displayProducts);

            // Set up initial field mappings for Shopify format
            const initialMappings: FieldMapping[] = [
              { csvField: 'Title', dbField: 'name' },
              { csvField: 'Body (HTML)', dbField: 'description' },
              { csvField: 'Variant Price', dbField: 'base_price' },
              { csvField: 'Type', dbField: 'type' },
              { csvField: 'Image Src', dbField: 'image_url' },
              { csvField: 'Published', dbField: 'is_featured' }
            ].filter(mapping => availableHeaders.includes(mapping.csvField));

            setFieldMappings(initialMappings);
          } else {
            // Check if this is our standard template format
            const isStandardTemplate = availableHeaders.includes('name') &&
              availableHeaders.includes('price') &&
              availableHeaders.includes('description');

            if (isStandardTemplate) {
              console.log('Detected standard template format.');

              // Set up initial field mappings for standard format
              const initialMappings: FieldMapping[] = [
                { csvField: 'name', dbField: 'name' },
                { csvField: 'description', dbField: 'description' },
                { csvField: 'price', dbField: 'base_price' },
                { csvField: 'category', dbField: 'type' },
                { csvField: 'image_url', dbField: 'image_url' },
                { csvField: 'is_featured', dbField: 'is_featured' }
              ].filter(mapping => availableHeaders.includes(mapping.csvField));

              setFieldMappings(initialMappings);
            } else {
              // Unknown format - let the user map the fields manually
              console.log('Unknown CSV format. User will need to map fields manually.');
              setFieldMappings([]);
            }
          }

          // Show the header mapping modal
          setProcessingStep('mapping-headers');
          setShowMappingModal(true);

          // The rest of the process will continue after the user confirms the header mapping in the continueImportProcess function

        } catch (error) {
          console.error('Error processing CSV:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to process CSV file');
          setErrors(prev => [...prev, error instanceof Error ? error.message : 'Unknown error']);
          setUploading(false);
        }
      },
      error: (error) => {
        setUploading(false);
        toast.error(`Error parsing CSV: ${error.message}`);
        setErrors([error.message]);
      }
    });
  };

  /**
   * Process images from product URLs and upload them to Cloudinary
   * @param products The products with image URLs
   * @returns Products with Cloudinary image URLs
   */
  const processImages = async (products: CSVProduct[]): Promise<CSVProduct[]> => {
    const productsWithImages = [...products];
    let imagesProcessed = 0;
    let imagesUploaded = 0;
    let imagesFailed = 0;

    // Find products with image URLs
    const productsWithImageUrls = productsWithImages.filter(product => product.image_url);

    if (productsWithImageUrls.length === 0) {
      // No images to process
      setStats(prev => ({
        ...prev,
        imagesProcessed: 0,
        imagesUploaded: 0,
        imagesFailed: 0
      }));
      return productsWithImages;
    }

    // Process each image
    for (let i = 0; i < productsWithImageUrls.length; i++) {
      const product = productsWithImageUrls[i];
      imagesProcessed++;

      try {
        // Update progress
        const progressPercent = Math.round((i / productsWithImageUrls.length) * 100);
        setProgress(progressPercent);

        // Upload image to Cloudinary
        if (product.image_url) {
          const cloudinaryUrl = await uploadImageFromUrl(product.image_url);

          if (cloudinaryUrl) {
            // Update product with Cloudinary URL
            const index = productsWithImages.findIndex(p =>
              p.name === product.name && p.price === product.price
            );

            if (index !== -1) {
              productsWithImages[index].image_url = cloudinaryUrl;

              // We'll save the image to the product_images table after the product is created
              // This is handled in the saveProductsToDatabase function

              imagesUploaded++;
            }
          } else {
            imagesFailed++;
          }
        }

        // Update stats
        setStats(prev => ({
          ...prev,
          imagesProcessed,
          imagesUploaded,
          imagesFailed
        }));
      } catch (error) {
        console.error(`Error processing image for product ${product.name}:`, error);
        imagesFailed++;
        setStats(prev => ({
          ...prev,
          imagesProcessed,
          imagesUploaded,
          imagesFailed
        }));
        setErrors(prev => [...prev, `Error processing image for product ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      }
    }

    return productsWithImages;
  };
  /**
   * Function to strip HTML tags from text
   * @param html HTML text to strip
   * @returns Plain text without HTML tags
   */
  const stripHtmlTags = (html: string | null | undefined): string => {
    if (!html) return '';
    // Check if the content contains HTML tags
    if (/<\/?[a-z][\s\S]*>/i.test(html)) {
      // Replace HTML tags with nothing
      return html.replace(/<\/?[a-z][\s\S]*>/gi, '');
    }
    return html;
  };

  /**
   * Save products to the database
   * @param products The products to save
   */
  const saveProductsToDatabase = async (products: CSVProduct[]): Promise<void> => {
    let processed = 0;
    let successful = 0;
    let failed = 0;
    const newErrors: string[] = [];

    // Process products in batches to improve performance
    const batchSize = 10;
    const batches = [];

    // Split products into batches
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchPromises = batch.map(async (product, index) => {
        const productIndex = batchIndex * batchSize + index;
        processed++;

        try {
          // Validate required fields
          if (!product.name) {
            throw new Error(`Row ${processed}: Missing required field 'name'`);
          }

          // Check for price or base_price
          if (!product.price && !product.base_price) {
            console.warn(`Row ${processed}: Missing price - using default value of 0`);
            product.price = '0';
          }

          // Check if product already exists to avoid duplicates
          const { data: existingProducts, error: checkError } = await supabase
            .from('products')
            .select('id')
            .eq('name', product.name)
            .limit(1);

          if (checkError) {
            console.error('Error checking for existing product:', checkError);
          }

          // If product already exists, update it instead of creating a new one
          if (existingProducts && existingProducts.length > 0) {
            const existingId = existingProducts[0].id;

            // Format data properly - only include fields that exist in the database
            const formattedProduct = {
              description: stripHtmlTags(product.description || product['Body (HTML)'] || null),
              base_price: parseFloat(product.price as string) || parseFloat(product.base_price as string) || 0,
              // Check if category exists in the database schema
              ...(product.category && { type: product.category }),
              image_url: product.image_url || null,
              // Skip dimensions and material fields as they don't exist in the database
              is_featured: product.is_featured === true || product.is_featured === 'true',
              updated_at: new Date().toISOString(),
              // Store handle in meta_keywords for Shopify products
              ...(product.Handle && { meta_keywords: product.Handle }),
            };

            // Use the simplified CSV import API
            const response = await fetch('/api/admin/csv-import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                operation: 'update_product',
                data: {
                  product: {
                    id: existingId,
                    ...formattedProduct
                  }
                }
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Row ${processed}: ${errorData.error || response.statusText}`);
            }

            // Always process variations for existing products, whether Shopify or not
            try {
              console.log('Processing variations for existing product:', existingId);
              if (product._isShopifyProduct) {
                await processProductVariations(existingId, product);
              } else {
                // For non-Shopify products, create a default variation
                console.log('Creating default variation for existing product');
                await createOrUpdateVariation(
                  existingId,
                  'Size',
                  'Default Size',
                  'Frame',
                  'Default Frame',
                  product
                );
              }
            } catch (variationError) {
              console.error('Error processing variations:', variationError);
              // Don't fail the whole import if variations fail
            }

            successful++;
            return { success: true };
          } else {
            // Format data properly for new product - only include fields that exist in the database
            const formattedProduct = {
              name: product.name,
              description: stripHtmlTags(product.description || product['Body (HTML)'] || null),
              base_price: parseFloat(product.price as string) || parseFloat(product.base_price as string) || 0,
              // Check if category exists in the database schema
              ...(product.category && { type: product.category }),
              image_url: product.image_url || null,
              // Skip dimensions and material fields as they don't exist in the database
              is_featured: product.is_featured === true || product.is_featured === 'true',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Store handle in meta_keywords for Shopify products
              ...(product.Handle && { meta_keywords: product.Handle }),
            };

            // Use the simplified CSV import API
            const response = await fetch('/api/admin/csv-import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                operation: 'create_product',
                data: {
                  product: formattedProduct
                }
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Row ${processed}: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();

            // Store the product ID for later use (e.g., for image uploads)
            if (data && data.id) {
              // Store the ID directly on the current product
              product._id = data.id;

              // Always process variations for new products, whether Shopify or not
              const newProductId = data.id;
              try {
                console.log('Processing variations for new product:', newProductId);
                if (product._isShopifyProduct) {
                  await processProductVariations(newProductId, product);
                } else {
                  // For non-Shopify products, create a default variation
                  console.log('Creating default variation for new product');
                  await createOrUpdateVariation(
                    newProductId,
                    'Size',
                    'Default Size',
                    'Frame',
                    'Default Frame',
                    product
                  );
                }
              } catch (variationError) {
                console.error('Error processing variations:', variationError);
                // Don't fail the whole import if variations fail
              }

              // Save the image to the product_images table if it exists
              if (product.image_url && product.image_url.includes('cloudinary')) {
                try {
                  // Use the simplified CSV import API to save the image
                  const imageResponse = await fetch('/api/admin/csv-import', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      operation: 'create_product_image',
                      data: {
                        productId: data.id,
                        imageUrl: product.image_url,
                        isPrimary: true,
                        sortOrder: 1
                      }
                    }),
                  });

                  if (!imageResponse.ok) {
                    console.error('Error saving product image:', await imageResponse.text());
                  }
                } catch (imageError) {
                  console.error('Error in image API call:', imageError);
                }
              }
            }

            successful++;
            return { success: true };
          }
        } catch (error) {
          failed++;
          newErrors.push((error as Error).message);
          return { success: false, error };
        }
      });

      // Wait for all products in the batch to be processed
      try {
        await Promise.all(batchPromises);
      } catch (error) {
        console.error('Error processing batch:', error);
        // Continue with the next batch even if this one had errors
      }

      // Update progress after each batch
      const progressPercent = Math.round(((batchIndex + 1) / batches.length) * 100);
      setProgress(progressPercent);

      // Update stats after each batch
      setStats(prev => ({
        ...prev,
        processed,
        successful,
        failed
      }));
    }

    setErrors(prev => [...prev, ...newErrors]);
    setUploading(false);

    if (successful > 0) {
      toast.success(`Successfully imported ${successful} products`);
    }

    if (failed > 0) {
      toast.error(`Failed to import ${failed} products`);
    }
  };
  /**
   * Continue the import process after header mapping
   */
  const continueImportProcess = async () => {
    try {
      // Close the mapping modal
      setShowMappingModal(false);

      // Apply the field mappings to transform the products
      const transformedProducts = parsedProducts.map(product => {
        const transformedProduct: CSVProduct = {};

        // Apply each mapping
        fieldMappings.forEach(mapping => {
          if (product[mapping.csvField] !== undefined) {
            transformedProduct[mapping.dbField] = product[mapping.csvField];
          }
        });

        // For Shopify format, ensure we use the Handle as a fallback for name
        if (product.Handle && !transformedProduct.name) {
          transformedProduct.name = product.Handle;
        }

        // Convert price strings to numbers
        if (transformedProduct.base_price) {
          // Remove currency symbols and commas
          const priceString = String(transformedProduct.base_price).replace(/[$,]/g, '');
          transformedProduct.base_price = parseFloat(priceString) || 0;
        }

        // Convert is_featured to boolean
        if (transformedProduct.is_featured !== undefined) {
          transformedProduct.is_featured =
            transformedProduct.is_featured === true ||
            transformedProduct.is_featured === 'true' ||
            transformedProduct.is_featured === 'TRUE' ||
            transformedProduct.is_featured === '1' ||
            transformedProduct.is_featured === 1;
        }

        // Preserve Shopify-specific fields for variations
        if (product._isShopifyProduct) {
          // Copy over the variation-related fields
          transformedProduct._isShopifyProduct = true;
          transformedProduct.Handle = product.Handle;
          transformedProduct['Option1 Name'] = product['Option1 Name'];
          transformedProduct['Option1 Value'] = product['Option1 Value'];
          transformedProduct['Option2 Name'] = product['Option2 Name'];
          transformedProduct['Option2 Value'] = product['Option2 Value'];
          transformedProduct['Variant SKU'] = product['Variant SKU'];
          transformedProduct['Variant Weight'] = product['Variant Weight'];
          transformedProduct['Variant Weight Unit'] = product['Variant Weight Unit'];
          transformedProduct['Cost per item'] = product['Cost per item'];
          transformedProduct.Status = product.Status;

          // Also preserve variations
          if (product._variations && Array.isArray(product._variations)) {
            transformedProduct._variations = product._variations.map(variation => {
              // Apply the same field mappings to each variation
              const transformedVariation: CSVProduct = {};

              // Copy over all the original fields first
              Object.keys(variation).forEach(key => {
                transformedVariation[key] = variation[key];
              });

              // Then apply the mappings
              fieldMappings.forEach(mapping => {
                if (variation[mapping.csvField] !== undefined) {
                  transformedVariation[mapping.dbField] = variation[mapping.csvField];
                }
              });

              return transformedVariation;
            });
          }
        }

        return transformedProduct;
      });

      // Filter out empty rows and rows without required fields
      const validProducts = transformedProducts.filter(product => {
        // Check if the product has any data
        if (!product || Object.keys(product).length === 0) return false;

        // Check if the product has a name (the only truly required field)
        if (!product.name) return false;

        // If price is missing, set a default value
        if (product.base_price === undefined && product.price === undefined) {
          console.warn(`Product ${product.name} is missing price - using default value of 0`);
          product.base_price = 0;
        }

        return true;
      });

      console.log('Valid products after mapping:', validProducts.length);

      if (validProducts.length === 0) {
        throw new Error('No valid products found after mapping. Products must have at least a name and price.');
      }

      // Step 1: Process images
      setProcessingStep('uploading-images');
      const productsWithCloudinaryImages = await processImages(validProducts);

      // Step 2: Save products to database
      setProcessingStep('saving-products');
      await saveProductsToDatabase(productsWithCloudinaryImages);

      setProcessingStep('complete');

      // Show success message with details
      toast.success(`Import complete: ${stats.successful} products imported successfully${stats.failed > 0 ? `, ${stats.failed} failed` : ''}`);

      // Redirect to products page after 2 seconds to see the imported products
      if (stats.successful > 0) {
        setTimeout(() => {
          window.location.href = '/admin/products';
        }, 2000);
      }
    } catch (error) {
      console.error('Error continuing import process:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process products');
      setErrors(prev => [...prev, error instanceof Error ? error.message : 'Unknown error']);
      setUploading(false);
    }
  };

  /**
   * Update a field mapping
   */
  const updateFieldMapping = (index: number, dbField: string) => {
    const newMappings = [...fieldMappings];
    newMappings[index].dbField = dbField;
    setFieldMappings(newMappings);
  };

  /**
   * Add a new field mapping
   */
  const addFieldMapping = (csvField: string) => {
    // Don't add if this CSV field is already mapped
    if (fieldMappings.some(mapping => mapping.csvField === csvField)) {
      return;
    }

    setFieldMappings([...fieldMappings, { csvField, dbField: '' }]);
  };

  /**
   * Remove a field mapping
   */
  const removeFieldMapping = (index: number) => {
    const newMappings = [...fieldMappings];
    newMappings.splice(index, 1);
    setFieldMappings(newMappings);
  };

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-6">Import Products</h1>

        {/* Header Mapping Modal */}
        {showMappingModal && (
          <div className="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-z-50">
            <div className="tw-bg-white tw-rounded-lg tw-shadow-xl tw-p-6 tw-w-full tw-max-w-4xl tw-max-h-[90vh] tw-overflow-y-auto">
              <h2 className="tw-text-2xl tw-font-bold tw-mb-4">Map CSV Headers to Database Fields</h2>

              <p className="tw-mb-4 tw-text-gray-600">
                Please map your CSV headers to the corresponding database fields. This will ensure your data is imported correctly.
              </p>

              <div className="tw-mb-6">
                <h3 className="tw-text-lg tw-font-semibold tw-mb-2">Field Mappings</h3>

                <div className="tw-overflow-x-auto">
                  <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                    <thead className="tw-bg-gray-50">
                      <tr>
                        <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                          CSV Header
                        </th>
                        <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                          Database Field
                        </th>
                        <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                      {fieldMappings.map((mapping, index) => (
                        <tr key={index}>
                          <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                            <div className="tw-text-sm tw-text-gray-900">{mapping.csvField}</div>
                          </td>
                          <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                            <select
                              value={mapping.dbField}
                              onChange={(e) => updateFieldMapping(index, e.target.value)}
                              className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                            >
                              <option value="">-- Select Database Field --</option>
                              {availableDatabaseFields.map((field) => (
                                <option key={field.value} value={field.value}>
                                  {field.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                            <button
                              onClick={() => removeFieldMapping(index)}
                              className="tw-text-red-600 hover:tw-text-red-900"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add new mapping */}
                <div className="tw-mt-4">
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Add CSV Header
                  </label>
                  <div className="tw-flex tw-space-x-2">
                    <select
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      onChange={(e) => e.target.value && addFieldMapping(e.target.value)}
                      value=""
                    >
                      <option value="">-- Select CSV Header --</option>
                      {csvHeaders
                        .filter(header => !fieldMappings.some(mapping => mapping.csvField === header))
                        .map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-shadow-sm tw-text-white tw-bg-black hover:tw-bg-gray-800 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-[#A6A182]"
                      onClick={() => {
                        const select = document.querySelector('select') as HTMLSelectElement;
                        if (select && select.value) {
                          addFieldMapping(select.value);
                          select.value = '';
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="tw-flex tw-justify-end tw-space-x-3">
                <button
                  onClick={() => {
                    setShowMappingModal(false);
                    setUploading(false);
                  }}
                  className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-text-sm tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={continueImportProcess}
                  className="tw-inline-flex tw-items-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-shadow-sm tw-text-white tw-bg-black hover:tw-bg-gray-800 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-[#A6A182]"
                >
                  Continue Import
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6 tw-mb-8">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">CSV Import</h2>

          <p className="tw-mb-4 tw-text-gray-600">
            Upload a CSV file with product data. You'll be able to map the CSV headers to database fields after uploading.
          </p>

          <div className="tw-bg-blue-50 tw-p-4 tw-rounded-md tw-mb-4">
            <h3 className="tw-font-medium tw-text-blue-700 tw-mb-2">Supported CSV Formats</h3>
            <div className="tw-text-blue-600 tw-text-sm tw-space-y-2">
              <p>
                <strong>Standard Template:</strong> Use our template with columns: name, description, price, etc.
                <a href="/templates/product_import_template.csv" download className="tw-ml-2 tw-underline">Download Template</a>
              </p>
              <p>
                <strong>Shopify CSV Export:</strong> Upload your Shopify product export file directly! The system will:
              </p>
              <ul className="tw-list-disc tw-pl-5 tw-mt-1">
                <li>Group products with the same "Handle" (treating them as variants)</li>
                <li>Use the first row with a "Title" as the main product data</li>
                <li>Automatically suggest mappings for Shopify columns</li>
              </ul>
              <p className="tw-mt-2">
                <strong>Other CSV Formats:</strong> For any other CSV format, you'll be able to manually map your columns to our database fields.
              </p>
            </div>
          </div>

          <div className="tw-mt-4 tw-mb-6">
            <label className="tw-block tw-mb-2 tw-font-medium">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              disabled={uploading}
              className="tw-block tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
            />
          </div>

          {uploading && (
            <div className="tw-my-4">
              <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2.5">
                <div
                  className="tw-bg-[#A6A182] tw-h-2.5 tw-rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="tw-mt-2 tw-flex tw-items-center">
                {processingStep === 'parsing' && (
                  <>
                    <FaFileUpload className="tw-mr-2 tw-text-[#A6A182]" />
                    <p className="tw-text-sm tw-text-gray-600">Parsing CSV file...</p>
                  </>
                )}
                {processingStep === 'mapping-headers' && (
                  <>
                    <FaArrowRight className="tw-mr-2 tw-text-[#A6A182]" />
                    <p className="tw-text-sm tw-text-gray-600">Mapping CSV headers to database fields...</p>
                  </>
                )}
                {processingStep === 'uploading-images' && (
                  <>
                    <FaCloudUploadAlt className="tw-mr-2 tw-text-[#A6A182]" />
                    <p className="tw-text-sm tw-text-gray-600">
                      Uploading images to Cloudinary...
                      ({stats.imagesUploaded}/{stats.imagesProcessed})
                    </p>
                  </>
                )}
                {processingStep === 'saving-products' && (
                  <>
                    <FaFileUpload className="tw-mr-2 tw-text-[#A6A182]" />
                    <p className="tw-text-sm tw-text-gray-600">
                      Saving products to database...
                      ({stats.successful}/{stats.processed})
                    </p>
                  </>
                )}
                {processingStep === 'complete' && (
                  <>
                    <FaCheckCircle className="tw-mr-2 tw-text-green-600" />
                    <p className="tw-text-sm tw-text-gray-600">Processing complete!</p>
                  </>
                )}
              </div>
            </div>
          )}

          {!uploading && stats.processed > 0 && (
            <div className="tw-my-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
              <h3 className="tw-font-medium tw-mb-2">Import Summary</h3>

              <div className="tw-mb-4">
                <h4 className="tw-text-sm tw-font-medium tw-mb-2">Products</h4>
                <div className="tw-grid tw-grid-cols-4 tw-gap-4">
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Processed</p>
                    <p className="tw-text-lg tw-font-semibold">{stats.processed}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-green-500">Successful</p>
                    <p className="tw-text-lg tw-font-semibold">{stats.successful}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-red-500">Failed</p>
                    <p className="tw-text-lg tw-font-semibold">{stats.failed}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-[#A6A182]">Variations</p>
                    <p className="tw-text-lg tw-font-semibold">
                      {parsedProducts.reduce((count, product) => {
                        // Count variations in each product
                        return count + (product._variations?.length || 0) + (product._isShopifyProduct ? 1 : 0);
                      }, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {stats.imagesProcessed > 0 && (
                <div>
                  <h4 className="tw-text-sm tw-font-medium tw-mb-2">Images</h4>
                  <div className="tw-grid tw-grid-cols-3 tw-gap-4">
                    <div>
                      <p className="tw-text-sm tw-text-gray-500">Processed</p>
                      <p className="tw-text-lg tw-font-semibold">{stats.imagesProcessed}</p>
                    </div>
                    <div>
                      <p className="tw-text-sm tw-text-green-500">Uploaded to Cloudinary</p>
                      <p className="tw-text-lg tw-font-semibold">{stats.imagesUploaded}</p>
                    </div>
                    <div>
                      <p className="tw-text-sm tw-text-red-500">Failed</p>
                      <p className="tw-text-lg tw-font-semibold">{stats.imagesFailed}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {errors.length > 0 && (
            <div className="tw-mt-4">
              <h3 className="tw-font-medium tw-mb-2 tw-text-red-500">Errors</h3>
              <div className="tw-max-h-40 tw-overflow-y-auto tw-bg-red-50 tw-p-3 tw-rounded-md">
                <ul className="tw-list-disc tw-pl-5 tw-space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="tw-text-sm tw-text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="tw-mt-6">
            <div className="tw-flex tw-items-center tw-mb-2">
              <p className="tw-text-sm tw-font-medium tw-text-gray-700">Sample CSV Formats:</p>
              <div className="tw-ml-auto">
                <a
                  href="/templates/product_import_template.csv"
                  download
                  className="tw-text-[#A6A182] hover:tw-text-black tw-text-sm tw-underline tw-mr-4"
                >
                  Download Standard Template
                </a>
              </div>
            </div>

            <div className="tw-mb-4">
              <p className="tw-text-sm tw-text-gray-500 tw-mb-1">Standard Template Format:</p>
              <pre className="tw-bg-gray-50 tw-p-3 tw-rounded-md tw-text-xs tw-overflow-x-auto">
                name,description,price,stock_quantity,category,image_url,is_featured{"\n"}
                "Acrylic Painting","Beautiful landscape painting",199.99,10,"Paintings","https://example.com/image1.jpg",true{"\n"}
                "Bronze Sculpture","Abstract modern sculpture",499.99,5,"Sculptures","https://example.com/image2.jpg",false
              </pre>
            </div>

            <div>
              <p className="tw-text-sm tw-text-gray-500 tw-mb-1">Shopify Export Format (simplified):</p>
              <pre className="tw-bg-gray-50 tw-p-3 tw-rounded-md tw-text-xs tw-overflow-x-auto">
                Handle,Title,Body (HTML),Type,Variant Price,Image Src,Published{"\n"}
                "product-1","Product Name","<p>Product description</p>","Category",199.99,"https://example.com/image1.jpg",true{"\n"}
                "product-1","","","",299.99,"https://example.com/image2.jpg",{"\n"}
                "product-2","Another Product","<p>Another description</p>","Category",99.99,"https://example.com/image3.jpg",true
              </pre>
              <p className="tw-text-xs tw-text-gray-500 tw-mt-1 tw-italic">
                Note: Shopify exports contain many more columns. The system will handle grouping products with the same Handle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SimpleAdminLayout>
  );
}
