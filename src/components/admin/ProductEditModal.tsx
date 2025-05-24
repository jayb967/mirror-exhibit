"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useSupabaseClient } from '@/utils/supabase-client';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  base_price: number;
  stock_quantity: number;
  category: string | null;
  category_id: string | null;
  image_url: string | null;
  dimensions: string | null;
  material: string | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
  status?: string | null;
  main_image_url: string | null;
  variations_count?: { count: number }[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Size {
  id: string;
  name: string;
  dimensions: string;
  code: string;
  price_adjustment: number;
  is_active: boolean;
}

interface FrameType {
  id: string;
  name: string;
  material: string;
  color: string | null;
  description: string | null;
  price_adjustment: number;
  is_active: boolean;
}

interface ProductVariation {
  id: string;
  size_id: string;
  frame_type_id: string;
  stock_quantity: number;
  price: number;
  sku: string | null;
  is_active: boolean;
  product_sizes?: { name: string; dimensions: string } | { name: string; dimensions: string }[];
  frame_types?: { name: string; material: string } | { name: string; material: string }[];
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

interface ProductEditModalProps {
  isOpen: boolean;
  product: Product | null;
  categories: Category[];
  sizes: Size[];
  frameTypes: FrameType[];
  onClose: () => void;
  onSave: () => void;
}

export default function ProductEditModal({
  isOpen,
  product,
  categories,
  sizes,
  frameTypes,
  onClose,
  onSave
}: ProductEditModalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [categoryId, setCategoryId] = useState('');

  const [isFeatured, setIsFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Product options state
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFrameTypes, setSelectedFrameTypes] = useState<string[]>([]);
  const [productVariations, setProductVariations] = useState<ProductVariation[]>([]);

  // Image management state
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const supabase = useSupabaseClient();

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.base_price?.toString() || product.price?.toString() || '');

      setCategoryId(product.category_id || '');

      setIsFeatured(product.is_featured || false);
      setMetaTitle(product.meta_title || '');
      setMetaDescription(product.meta_description || '');
      setMetaKeywords(product.meta_keywords || '');

      // Fetch product variations and images
      fetchProductVariations(product.id);
      fetchProductImages(product.id);
    }
  }, [product]);

  // Fetch product variations
  const fetchProductVariations = async (productId: string) => {
    try {
      const { data: variationsData, error: variationsError } = await supabase
        .from('product_variations')
        .select(`
          id, size_id, frame_type_id, stock_quantity, price, sku, is_active,
          product_sizes(name, dimensions),
          frame_types(name, material)
        `)
        .eq('product_id', productId)
        .eq('is_active', true);

      if (variationsError) throw variationsError;
      setProductVariations(variationsData || []);

      // Extract selected sizes and frame types
      const sizeIds = [...new Set(variationsData?.map(v => v.size_id) || [])];
      const frameTypeIds = [...new Set(variationsData?.map(v => v.frame_type_id) || [])];

      setSelectedSizes(sizeIds);
      setSelectedFrameTypes(frameTypeIds);

    } catch (error) {
      console.error('Error fetching product variations:', error);
      toast.error('Failed to load product variations');
    }
  };

  // Fetch product images
  const fetchProductImages = async (productId: string) => {
    try {
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order');

      if (imagesError) throw imagesError;
      setProductImages(imagesData || []);

    } catch (error) {
      console.error('Error fetching product images:', error);
      toast.error('Failed to load product images');
    }
  };

  // Handle multiple image upload
  const handleImageUpload = async (files: FileList) => {
    if (!product) return;

    try {
      setIsUploading(true);
      const uploadedImages: ProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((i / files.length) * 100);

        // Create FormData for Cloudinary upload
        const formData = new FormData();
        formData.append('file', file);

        // Upload to Cloudinary via API
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const uploadResult = await uploadResponse.json();

        // Save to database
        const newSortOrder = Math.max(...productImages.map(img => img.sort_order), 0) + 1 + i;
        const { data: imageData, error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            image_url: uploadResult.url,
            is_primary: productImages.length === 0 && i === 0, // First image is primary if no images exist
            sort_order: newSortOrder
          })
          .select()
          .single();

        if (dbError) throw dbError;
        uploadedImages.push(imageData);
      }

      setProductImages(prev => [...prev, ...uploadedImages]);
      setUploadProgress(100);
      toast.success(`${files.length} image(s) uploaded successfully`);

    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      // Find the image to get its URL
      const imageToDelete = productImages.find(img => img.id === imageId);
      if (!imageToDelete) {
        toast.error('Image not found');
        return;
      }

      // Delete from database first
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Delete from Cloudinary
      try {
        const deleteResponse = await fetch('/api/cloudinary/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: imageToDelete.image_url
          }),
        });

        if (!deleteResponse.ok) {
          console.warn('Failed to delete image from Cloudinary, but database deletion succeeded');
        } else {
          const deleteResult = await deleteResponse.json();
          console.log('Image deleted from Cloudinary:', deleteResult);
        }
      } catch (cloudinaryError) {
        console.warn('Error deleting from Cloudinary:', cloudinaryError);
        // Don't fail the entire operation if Cloudinary deletion fails
      }

      setProductImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');

    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  // Set primary image
  const handleSetPrimary = async (imageId: string) => {
    if (!product) return;

    try {
      // First, unset all primary flags
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', product.id);

      // Then set the selected image as primary
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;

      setProductImages(prev =>
        prev.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }))
      );

      toast.success('Primary image updated');

    } catch (error) {
      console.error('Error setting primary image:', error);
      toast.error('Failed to set primary image');
    }
  };

  // Generate unique SKU with duplicate checking
  const generateUniqueSku = async (productName: string, sizeCode: string, frameTypeName: string): Promise<string> => {
    // Create base SKU from product name, size code, and frame type
    const cleanProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
    const cleanSizeCode = sizeCode.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanFrameType = frameTypeName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);

    let baseSku = `${cleanProductName}-${cleanSizeCode}-${cleanFrameType}`;
    let finalSku = baseSku;
    let counter = 1;

    // Check for duplicates and append counter if needed
    while (true) {
      const { data: existingSku } = await supabase
        .from('product_variations')
        .select('id')
        .eq('sku', finalSku)
        .maybeSingle();

      if (!existingSku) {
        break; // SKU is unique
      }

      // SKU exists, try with counter
      finalSku = `${baseSku}-${counter}`;
      counter++;

      // Safety check to prevent infinite loop
      if (counter > 999) {
        finalSku = `${baseSku}-${Date.now()}`;
        break;
      }
    }

    return finalSku;
  };

  // Reorder images
  const handleReorderImages = async (draggedId: string, targetId: string) => {
    const draggedIndex = productImages.findIndex(img => img.id === draggedId);
    const targetIndex = productImages.findIndex(img => img.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newImages = [...productImages];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedImage);

    // Update sort orders
    const updates = newImages.map((img, index) => ({
      id: img.id,
      sort_order: index + 1
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('product_images')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }

      setProductImages(newImages.map((img, index) => ({
        ...img,
        sort_order: index + 1
      })));

      toast.success('Image order updated');

    } catch (error) {
      console.error('Error reordering images:', error);
      toast.error('Failed to reorder images');
    }
  };

  // Save product changes
  const handleSave = async () => {
    if (!product) return;

    try {
      setSaving(true);

      // Validate required fields
      if (!name.trim()) {
        toast.error('Product name is required');
        return;
      }

      if (!price || parseFloat(price) <= 0) {
        toast.error('Valid price is required');
        return;
      }

      // Update product data
      const updateData = {
        name: name.trim(),
        description: description.trim() || null,
        base_price: parseFloat(price),
        category_id: categoryId || null, // Only use category_id, not category
        is_featured: isFeatured,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        meta_keywords: metaKeywords.trim() || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);

      if (error) throw error;

      console.log('Product basic data saved successfully');

      // Handle product variations if sizes and frame types are selected
      if (selectedSizes.length > 0 && selectedFrameTypes.length > 0) {
        console.log('Updating variations with:', { selectedSizes, selectedFrameTypes });
        try {
          await handleVariationsUpdate();
          console.log('Variations updated successfully');
        } catch (variationError) {
          console.error('Error updating variations:', variationError);
          // Still show success for product update, but warn about variations
          toast.success('Product updated successfully, but there was an issue with variations');
          toast.error('Variation update failed. Please try again or contact support.');
          onSave(); // Still call onSave since product was updated
          return;
        }
      } else if (selectedSizes.length > 0 || selectedFrameTypes.length > 0) {
        // If only one type is selected, show a warning but still save the product
        console.warn('Incomplete variation selection:', { selectedSizes, selectedFrameTypes });
        toast.warning('Product saved, but variations require both sizes and frame types to be selected');
      }

      toast.success('Product updated successfully');
      onSave(); // Call the parent's onSave callback

    } catch (error) {
      console.error('Error saving product:', error);
      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save product: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle product variations update using admin API
  const handleVariationsUpdate = async () => {
    if (!product) return;

    try {
      // Get current variations for this product
      const { data: currentVariations, error: fetchError } = await supabase
        .from('product_variations')
        .select('id, size_id, frame_type_id')
        .eq('product_id', product.id);

      if (fetchError) throw fetchError;

      // Create a set of current variation combinations
      const currentCombinations = new Set(
        currentVariations?.map(v => `${v.size_id}-${v.frame_type_id}`) || []
      );

      // Create a set of desired variation combinations
      const desiredCombinations = new Set();

      // Generate all combinations of selected sizes and frame types
      for (const sizeId of selectedSizes) {
        for (const frameTypeId of selectedFrameTypes) {
          const combination = `${sizeId}-${frameTypeId}`;
          desiredCombinations.add(combination);

          // If this combination doesn't exist, create it using the admin API
          if (!currentCombinations.has(combination)) {
            // Calculate price with adjustments
            const size = sizes.find(s => s.id === sizeId);
            const frameType = frameTypes.find(f => f.id === frameTypeId);
            const calculatedPrice = parseFloat(price) +
              (size?.price_adjustment || 0) +
              (frameType?.price_adjustment || 0);

            // Generate unique SKU
            const sku = await generateUniqueSku(
              product.name,
              size?.code || 'size',
              frameType?.name || frameType?.material || 'frame'
            );

            // Create variation using admin API
            const response = await fetch('/api/admin/product-variations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productId: product.id,
                sizeId: sizeId,
                frameTypeId: frameTypeId,
                action: 'create',
                variationData: {
                  price: calculatedPrice,
                  stock_quantity: 10, // Default stock
                  sku: sku,
                  is_active: true
                }
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Failed to create variation: ${errorData.error}`);
            }
          }
        }
      }

      // Delete variations that are no longer selected using admin API
      const variationsToDelete = currentVariations?.filter(v =>
        !desiredCombinations.has(`${v.size_id}-${v.frame_type_id}`)
      ) || [];

      // Ask for confirmation if variations will be deleted
      if (variationsToDelete.length > 0) {
        const confirmed = window.confirm(
          `This will delete ${variationsToDelete.length} existing product variation(s). Are you sure you want to continue?`
        );

        if (!confirmed) {
          throw new Error('Variation update cancelled by user');
        }
      }

      for (const variation of variationsToDelete) {
        const response = await fetch('/api/admin/product-variations', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: variation.id,
            action: 'delete'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn(`Failed to delete variation ${variation.id}:`, errorData.error);
          // Continue with other deletions even if one fails
        }
      }

      // Refresh variations display
      await fetchProductVariations(product.id);

    } catch (error) {
      console.error('Error updating variations:', error);
      console.error('Selected sizes:', selectedSizes);
      console.error('Selected frame types:', selectedFrameTypes);
      console.error('Product ID:', product.id);
      throw error; // Re-throw to be caught by main save function
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="tw-fixed tw-inset-0 tw-z-50 tw-overflow-y-auto">
      <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-px-4 tw-pt-4 tw-pb-20 tw-text-center sm:tw-block sm:tw-p-0">
        {/* Background overlay */}
        <div
          className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel - responsive sizing */}
        <div className="tw-inline-block tw-align-bottom tw-bg-white tw-text-left tw-overflow-hidden tw-shadow-xl tw-transform tw-transition-all sm:tw-my-8 sm:tw-align-middle tw-w-full tw-h-full sm:tw-h-auto sm:tw-max-w-4xl sm:tw-rounded-lg">
          {/* Fixed close button for mobile */}
          <div className="tw-absolute tw-top-4 tw-right-4 tw-z-10 sm:tw-hidden">
            <button
              onClick={onClose}
              className="tw-bg-white tw-rounded-full tw-p-2 tw-text-gray-400 hover:tw-text-gray-600 tw-shadow-lg"
            >
              <svg className="tw-h-6 tw-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal content */}
          <div className="tw-bg-white tw-px-4 tw-pt-5 tw-pb-4 sm:tw-p-6 tw-h-full tw-overflow-y-auto">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
              <h3 className="tw-text-lg tw-leading-6 tw-font-medium tw-text-gray-900">
                Edit Product: {product.name}
              </h3>
              <button
                onClick={onClose}
                className="tw-hidden sm:tw-block tw-bg-white tw-rounded-md tw-text-gray-400 hover:tw-text-gray-600 focus:tw-outline-none"
              >
                <svg className="tw-h-6 tw-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="tw-border-b tw-border-gray-200 tw-mb-6">
              <nav className="tw-flex tw-space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`tw-py-4 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                    activeTab === 'general'
                      ? 'tw-border-blue-600 tw-text-blue-600'
                      : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`tw-py-4 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                    activeTab === 'images'
                      ? 'tw-border-blue-600 tw-text-blue-600'
                      : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  Images ({productImages.length})
                </button>
                <button
                  onClick={() => setActiveTab('variations')}
                  className={`tw-py-4 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                    activeTab === 'variations'
                      ? 'tw-border-blue-600 tw-text-blue-600'
                      : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  Product Options
                </button>
                <button
                  onClick={() => setActiveTab('seo')}
                  className={`tw-py-4 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                    activeTab === 'seo'
                      ? 'tw-border-blue-600 tw-text-blue-600'
                      : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                  }`}
                >
                  SEO Settings
                </button>
              </nav>
            </div>

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="tw-space-y-6">
                <div>
                  <h4 className="tw-text-lg tw-font-medium tw-mb-4">Product Images</h4>
                  <p className="tw-text-sm tw-text-gray-500 tw-mb-6">
                    Upload multiple images for this product. The first image will be used as the primary image. You can reorder images by dragging and dropping.
                  </p>

                  {/* Upload Area */}
                  <div className="tw-mb-6">
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                      Upload New Images
                    </label>
                    <div className="tw-mt-1 tw-flex tw-justify-center tw-px-6 tw-pt-5 tw-pb-6 tw-border-2 tw-border-gray-300 tw-border-dashed tw-rounded-md">
                      <div className="tw-space-y-1 tw-text-center">
                        <svg className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="tw-flex tw-text-sm tw-text-gray-600">
                          <label className="tw-relative tw-cursor-pointer tw-bg-white tw-rounded-md tw-font-medium tw-text-indigo-600 hover:tw-text-indigo-500 focus-within:tw-outline-none focus-within:tw-ring-2 focus-within:tw-ring-offset-2 focus-within:tw-ring-indigo-500">
                            <span>Upload files</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                              className="tw-sr-only"
                            />
                          </label>
                          <p className="tw-pl-1">or drag and drop</p>
                        </div>
                        <p className="tw-text-xs tw-text-gray-500">PNG, JPG, GIF up to 10MB each</p>

                        {/* Enhanced Upload Progress Indicator */}
                        {isUploading && (
                          <div className="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg">
                            <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
                              <div className="tw-flex tw-items-center tw-space-x-2">
                                {/* Animated Upload Icon */}
                                <div className="tw-relative">
                                  <svg className="tw-w-5 tw-h-5 tw-text-blue-600 tw-animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  {/* Animated Ring */}
                                  <div className="tw-absolute tw-inset-0 tw-w-5 tw-h-5 tw-border-2 tw-border-blue-300 tw-border-t-blue-600 tw-rounded-full tw-animate-spin"></div>
                                </div>
                                <span className="tw-text-sm tw-font-medium tw-text-blue-800">
                                  Uploading images...
                                </span>
                              </div>
                              <span className="tw-text-sm tw-font-bold tw-text-blue-600">
                                {Math.round(uploadProgress)}%
                              </span>
                            </div>

                            {/* Progress Bar with Animation */}
                            <div className="tw-relative tw-w-full tw-bg-blue-100 tw-rounded-full tw-h-3 tw-overflow-hidden">
                              <div
                                className="tw-h-full tw-bg-gradient-to-r tw-from-blue-500 tw-to-blue-600 tw-rounded-full tw-transition-all tw-duration-300 tw-ease-out tw-relative"
                                style={{ width: `${uploadProgress}%` }}
                              >
                                {/* Animated Shine Effect */}
                                <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-transparent tw-via-white tw-to-transparent tw-opacity-30 tw-animate-pulse"></div>
                              </div>

                              {/* Progress Bar Glow */}
                              <div
                                className="tw-absolute tw-top-0 tw-left-0 tw-h-full tw-bg-blue-400 tw-rounded-full tw-opacity-50 tw-blur-sm tw-transition-all tw-duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>

                            {/* Upload Status Text */}
                            <div className="tw-mt-2 tw-text-xs tw-text-blue-600 tw-text-center">
                              {uploadProgress < 30 && "Preparing images..."}
                              {uploadProgress >= 30 && uploadProgress < 70 && "Uploading to Cloudinary..."}
                              {uploadProgress >= 70 && uploadProgress < 95 && "Processing images..."}
                              {uploadProgress >= 95 && "Almost done..."}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Current Images */}
                  {productImages.length > 0 && (
                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-3">
                        Current Images ({productImages.length})
                      </label>
                      <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4 tw-gap-4">
                        {productImages.map((image, index) => (
                          <div key={image.id} className="tw-relative tw-group tw-bg-white tw-border tw-border-gray-200 tw-rounded-lg tw-overflow-hidden">
                            <div className="tw-aspect-square tw-relative">
                              <Image
                                src={image.image_url}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="tw-object-cover"
                              />
                              {image.is_primary && (
                                <div className="tw-absolute tw-top-2 tw-left-2 tw-bg-green-500 tw-text-white tw-text-xs tw-px-2 tw-py-1 tw-rounded">
                                  Primary
                                </div>
                              )}
                            </div>

                            {/* Image Actions */}
                            <div className="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-flex tw-items-center tw-justify-center tw-space-x-2">
                              {!image.is_primary && (
                                <button
                                  onClick={() => handleSetPrimary(image.id)}
                                  className="tw-bg-blue-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs hover:tw-bg-blue-600"
                                >
                                  Set Primary
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="tw-bg-red-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-xs hover:tw-bg-red-600"
                              >
                                Delete
                              </button>
                            </div>

                            {/* Sort Order */}
                            <div className="tw-absolute tw-bottom-2 tw-right-2 tw-bg-white tw-text-gray-700 tw-text-xs tw-px-2 tw-py-1 tw-rounded tw-shadow">
                              #{image.sort_order}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="tw-mt-4 tw-text-sm tw-text-gray-500">
                        <p>• The primary image will be displayed as the main product image</p>
                        <p>• Images are ordered by their sort order number</p>
                        <p>• You can set any image as primary by clicking "Set Primary"</p>
                      </div>
                    </div>
                  )}

                  {productImages.length === 0 && (
                    <div className="tw-text-center tw-py-8 tw-text-gray-500">
                      <p>No images uploaded yet. Upload some images to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="tw-space-y-6">
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Base Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => {
                        setCategoryId(e.target.value);
                      }}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Featured Product
                    </label>
                    <div className="tw-flex tw-items-center">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300 tw-rounded"
                      />
                      <label className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
                        Mark as featured product
                      </label>
                    </div>
                  </div>

                  <div className="tw-col-span-2">
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      placeholder="Enter product description"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Variations Tab */}
            {activeTab === 'variations' && (
              <div className="tw-space-y-6">
                <div>
                  <h4 className="tw-text-lg tw-font-medium tw-mb-4">Product Options</h4>
                  <p className="tw-text-sm tw-text-gray-500 tw-mb-6">
                    Select the sizes and frame types available for this product. Variations will be automatically generated based on your selections.
                  </p>

                  <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                    {/* Sizes Selection */}
                    <div>
                      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
                        <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
                          Available Sizes
                        </label>
                        <div className="tw-flex tw-space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSizes(sizes.map(size => size.id))}
                            className="tw-text-xs tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-700 tw-rounded hover:tw-bg-blue-200 tw-transition-colors"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedSizes([])}
                            className="tw-text-xs tw-px-2 tw-py-1 tw-bg-gray-100 tw-text-gray-700 tw-rounded hover:tw-bg-gray-200 tw-transition-colors"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div className="tw-space-y-2 tw-max-h-48 tw-overflow-y-auto tw-border tw-border-gray-200 tw-rounded-md tw-p-3">
                        {sizes.map((size) => (
                          <div key={size.id} className="tw-flex tw-items-center">
                            <input
                              type="checkbox"
                              id={`size-${size.id}`}
                              checked={selectedSizes.includes(size.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSizes(prev => [...prev, size.id]);
                                } else {
                                  setSelectedSizes(prev => prev.filter(id => id !== size.id));
                                }
                              }}
                              className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300 tw-rounded"
                            />
                            <label htmlFor={`size-${size.id}`} className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
                              {size.name} ({size.dimensions})
                              {size.price_adjustment !== 0 && (
                                <span className="tw-text-gray-500 tw-ml-1">
                                  {size.price_adjustment > 0 ? '+' : ''}${size.price_adjustment}
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                      {selectedSizes.length > 0 && (
                        <p className="tw-text-xs tw-text-gray-500 tw-mt-2">
                          {selectedSizes.length} of {sizes.length} sizes selected
                        </p>
                      )}
                    </div>

                    {/* Frame Types Selection */}
                    <div>
                      <div className="tw-flex tw-items-center tw-justify-between tw-mb-3">
                        <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700">
                          Available Frame Types
                        </label>
                        <div className="tw-flex tw-space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedFrameTypes(frameTypes.map(frameType => frameType.id))}
                            className="tw-text-xs tw-px-2 tw-py-1 tw-bg-blue-100 tw-text-blue-700 tw-rounded hover:tw-bg-blue-200 tw-transition-colors"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedFrameTypes([])}
                            className="tw-text-xs tw-px-2 tw-py-1 tw-bg-gray-100 tw-text-gray-700 tw-rounded hover:tw-bg-gray-200 tw-transition-colors"
                          >
                            Deselect All
                          </button>
                        </div>
                      </div>
                      <div className="tw-space-y-2 tw-max-h-48 tw-overflow-y-auto tw-border tw-border-gray-200 tw-rounded-md tw-p-3">
                        {frameTypes.map((frameType) => (
                          <div key={frameType.id} className="tw-flex tw-items-center">
                            <input
                              type="checkbox"
                              id={`frame-${frameType.id}`}
                              checked={selectedFrameTypes.includes(frameType.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFrameTypes(prev => [...prev, frameType.id]);
                                } else {
                                  setSelectedFrameTypes(prev => prev.filter(id => id !== frameType.id));
                                }
                              }}
                              className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300 tw-rounded"
                            />
                            <label htmlFor={`frame-${frameType.id}`} className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
                              {frameType.name} ({frameType.material})
                              {frameType.price_adjustment !== 0 && (
                                <span className="tw-text-gray-500 tw-ml-1">
                                  {frameType.price_adjustment > 0 ? '+' : ''}${frameType.price_adjustment}
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                      {selectedFrameTypes.length > 0 && (
                        <p className="tw-text-xs tw-text-gray-500 tw-mt-2">
                          {selectedFrameTypes.length} of {frameTypes.length} frame types selected
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Current Variations */}
                  {productVariations.length > 0 && (
                    <div className="tw-mt-6">
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-3">
                        Current Variations ({productVariations.length})
                      </label>
                      <div className="tw-overflow-x-auto">
                        <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                          <thead className="tw-bg-gray-50">
                            <tr>
                              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                                Size
                              </th>
                              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                                Frame Type
                              </th>
                              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                                Price
                              </th>
                              <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                                SKU
                              </th>
                            </tr>
                          </thead>
                          <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                            {productVariations.map((variation) => (
                              <tr key={variation.id}>
                                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-900">
                                  {Array.isArray(variation.product_sizes)
                                    ? variation.product_sizes[0]?.name
                                    : variation.product_sizes?.name}
                                </td>
                                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-900">
                                  {Array.isArray(variation.frame_types)
                                    ? variation.frame_types[0]?.name
                                    : variation.frame_types?.name}
                                </td>
                                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-900">
                                  ${variation.price.toFixed(2)}
                                </td>
                                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-900">
                                  {variation.sku || 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {productVariations.length === 0 && (
                    <div className="tw-text-center tw-py-8 tw-text-gray-500">
                      <p>No variations found. Select sizes and frame types above to create variations.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="tw-space-y-6">
                <div>
                  <h4 className="tw-text-lg tw-font-medium tw-mb-4">SEO Settings</h4>
                  <p className="tw-text-sm tw-text-gray-500 tw-mb-6">
                    Optimize your product for search engines by setting custom meta tags.
                  </p>

                  <div className="tw-space-y-6">
                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                        placeholder="Enter meta title"
                      />
                      <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                        Recommended length: 50-60 characters. Current: {metaTitle.length}
                      </p>
                    </div>

                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                        Meta Description
                      </label>
                      <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        rows={3}
                        className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                        placeholder="Enter meta description"
                      />
                      <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                        Recommended length: 150-160 characters. Current: {metaDescription.length}
                      </p>
                    </div>

                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={metaKeywords}
                        onChange={(e) => setMetaKeywords(e.target.value)}
                        className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                        placeholder="Enter keywords separated by commas"
                      />
                      <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                        Separate keywords with commas. Example: art, gallery, modern, contemporary
                      </p>
                    </div>

                    <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md">
                      <h5 className="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-2">SEO Preview</h5>
                      <div className="tw-space-y-1">
                        <div className="tw-text-blue-600 tw-text-sm tw-font-medium">
                          {metaTitle || name || 'Product Title'}
                        </div>
                        <div className="tw-text-green-600 tw-text-xs">
                          mirrorexhibit.com/product/{product?.id}
                        </div>
                        <div className="tw-text-gray-600 tw-text-sm">
                          {metaDescription || description?.substring(0, 160) || 'Product description will appear here...'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="tw-flex tw-justify-end tw-space-x-3 tw-pt-6 tw-border-t tw-border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="tw-bg-white tw-py-2 tw-px-4 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="tw-bg-[#A6A182] tw-py-2 tw-px-4 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-sm tw-font-medium tw-text-white hover:tw-bg-[#8F8A6F] focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-[#A6A182] disabled:tw-opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
