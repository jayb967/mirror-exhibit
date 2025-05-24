"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSupabaseClient } from '@/utils/supabase-client';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';

export default function AddProductPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('general');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Import the image compression utility dynamically
      const { compressImage, createImagePreview } = await import('@/lib/imageOptimization');

      // Compress the image before uploading
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1, // Max size 1MB
        maxWidthOrHeight: 1200, // Max width/height 1200px
        quality: 0.8, // 80% quality
      });

      setImageFile(compressedFile);

      // Create and set preview
      const previewUrl = await createImagePreview(compressedFile);
      setImagePreview(previewUrl);

      // Show compression stats
      const compressionRatio = Math.round((file.size - compressedFile.size) / file.size * 100);
      toast.info(`Image compressed by ${compressionRatio}% (${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB)`);

    } catch (error) {
      console.error('Error compressing image:', error);

      // Fallback to original file if compression fails
      setImageFile(file);

      // Create preview with original file
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', imageFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      // Upload to our secure API endpoint
      // We use the server-side API route for security, but we could also use the Cloudinary URL directly
      // if we're using unsigned uploads with an upload preset
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();

      setIsUploading(false);
      setUploadProgress(100);

      // Return the optimized image URL
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name || !price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);

      // Handle image upload if selected
      let finalImageUrl = null;
      if (imageFile) {
        finalImageUrl = await uploadImage();
        if (!finalImageUrl) {
          toast.error('Failed to upload image');
          setSaving(false);
          return;
        }
      }

      // Prepare product data
      const productData = {
        name,
        description: description || null,
        price: parseFloat(price),
        stock_quantity: parseInt(stockQuantity, 10) || 0,
        category: category || null,
        image_url: finalImageUrl,
        dimensions: dimensions || null,
        material: material || null,
        is_featured: isFeatured,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert product into Supabase
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) throw error;

      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <h1 className="tw-text-3xl tw-font-bold">Add New Product</h1>
          <div className="tw-flex tw-space-x-2">
            <button
              onClick={() => router.push('/admin/products')}
              className="tw-bg-gray-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="tw-bg-green-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-green-700 disabled:tw-bg-green-400"
            >
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>

        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-mb-6">
          <div className="tw-border-b tw-border-gray-200">
            <nav className="tw-flex tw-space-x-4 tw-px-6 tw-py-3">
              <button
                onClick={() => setActiveTab('general')}
                className={`tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-rounded-md ${
                  activeTab === 'general'
                    ? 'tw-bg-blue-100 tw-text-blue-700'
                    : 'tw-text-gray-500 hover:tw-text-gray-700'
                }`}
              >
                General Info
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-rounded-md ${
                  activeTab === 'images'
                    ? 'tw-bg-blue-100 tw-text-blue-700'
                    : 'tw-text-gray-500 hover:tw-text-gray-700'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-rounded-md ${
                  activeTab === 'seo'
                    ? 'tw-bg-blue-100 tw-text-blue-700'
                    : 'tw-text-gray-500 hover:tw-text-gray-700'
                }`}
              >
                SEO
              </button>
            </nav>
          </div>
        </div>

        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
          <form onSubmit={handleSubmit}>
            {/* General Info Tab */}
            {activeTab === 'general' && (
              <div>
                <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                  <div className="tw-col-span-2">
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
                    ></textarea>
                  </div>

                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      placeholder="Enter category"
                    />
                  </div>

                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Dimensions
                    </label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      placeholder="e.g. 10x20x5 inches"
                    />
                  </div>

                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                      placeholder="e.g. Wood, Glass, etc."
                    />
                  </div>

                  <div>
                    <div className="tw-flex tw-items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300 tw-rounded"
                      />
                      <label htmlFor="featured" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
                        Featured Product
                      </label>
                    </div>
                    <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                      Featured products are displayed prominently on the homepage
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div>
                <div className="tw-mb-6">
                  <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                    Product Image
                  </label>
                  <div className="tw-mt-1 tw-flex tw-justify-center tw-px-6 tw-pt-5 tw-pb-6 tw-border-2 tw-border-gray-300 tw-border-dashed tw-rounded-md">
                    <div className="tw-space-y-1 tw-text-center">
                      {imagePreview ? (
                        <div>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="tw-mx-auto tw-h-64 tw-w-auto tw-object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="tw-mt-2 tw-inline-flex tw-items-center tw-px-2.5 tw-py-1.5 tw-border tw-border-transparent tw-text-xs tw-font-medium tw-rounded tw-text-red-700 tw-bg-red-100 hover:tw-bg-red-200 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="tw-flex tw-text-sm tw-text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="tw-relative tw-cursor-pointer tw-bg-white tw-rounded-md tw-font-medium tw-text-blue-600 hover:tw-text-blue-500 focus-within:tw-outline-none focus-within:tw-ring-2 focus-within:tw-ring-offset-2 focus-within:tw-ring-blue-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="tw-sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            <p className="tw-pl-1">or drag and drop</p>
                          </div>
                          <p className="tw-text-xs tw-text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {isUploading && (
                    <div className="tw-mt-2">
                      <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2.5">
                        <div
                          className="tw-bg-blue-600 tw-h-2.5 tw-rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div>
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
                      Recommended length: 50-60 characters
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
                    ></textarea>
                    <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
                      Recommended length: 150-160 characters
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
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </SimpleAdminLayout>
  );
}
