"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AdminLayout from '@/components/admin/layout/AdminLayout';

interface ProductEditParams {
  params: {
    id: string;
  };
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category: string | null;
  image_url: string | null;
  dimensions: string | null;
  material: string | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
}

export default function ProductEditPage({ params }: ProductEditParams) {
  const { id } = params;
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProduct(data);
          // Populate form fields
          setName(data.name || '');
          setDescription(data.description || '');
          setPrice(data.price?.toString() || '');
          setStockQuantity(data.stock_quantity?.toString() || '');
          setCategory(data.category || '');
          setImageUrl(data.image_url || '');
          setDimensions(data.dimensions || '');
          setMaterial(data.material || '');
          setIsFeatured(data.is_featured || false);

          // SEO fields
          setMetaTitle(data.meta_title || '');
          setMetaDescription(data.meta_description || '');
          setMetaKeywords(data.meta_keywords || '');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, supabase]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

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

      // Show compression stats
      const compressionRatio = Math.round((file.size - compressedFile.size) / file.size * 100);
      toast.info(`Image compressed by ${compressionRatio}% (${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB)`);

    } catch (error) {
      console.error('Error compressing image:', error);

      // Fallback to original file if compression fails
      setImageFile(file);
    }
  };

  const uploadImage = async () => {
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

      // Return the optimized image URL
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Handle image upload if a new image was selected
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      // Prepare product data
      const productData = {
        name,
        description: description || null,
        price: parseFloat(price),
        stock_quantity: parseInt(stockQuantity, 10),
        category: category || null,
        image_url: finalImageUrl || null,
        dimensions: dimensions || null,
        material: material || null,
        is_featured: isFeatured,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        meta_keywords: metaKeywords || null,
        updated_at: new Date().toISOString(),
      };

      // Update product in Supabase
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-blue-600 tw-border-t-transparent tw-rounded-full"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
          <div className="tw-bg-red-50 tw-p-4 tw-rounded-md">
            <h2 className="tw-text-red-800 tw-text-lg tw-font-medium">Product Not Found</h2>
            <p className="tw-mt-2 tw-text-red-700">
              The product you are trying to edit could not be found.
            </p>
            <button
              onClick={() => router.push('/admin/products')}
              className="tw-mt-4 tw-bg-red-700 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-red-800"
            >
              Back to Products
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <h1 className="tw-text-3xl tw-font-bold">Edit Product: {product.name}</h1>
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
              className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-blue-700 disabled:tw-bg-blue-400"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
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
                      Price ($) *
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
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
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
                      placeholder="e.g. Paintings, Sculptures"
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
                      placeholder="e.g. 24x36 inches"
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
                      placeholder="e.g. Canvas, Bronze"
                    />
                  </div>

                  <div>
                    <div className="tw-flex tw-items-center">
                      <input
                        id="is-featured"
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="tw-h-4 tw-w-4 tw-text-blue-600 focus:tw-ring-blue-500 tw-border-gray-300 tw-rounded"
                      />
                      <label htmlFor="is-featured" className="tw-ml-2 tw-block tw-text-sm tw-text-gray-900">
                        Featured Product
                      </label>
                    </div>
                    <p className="tw-mt-1 tw-text-xs tw-text-gray-500">Featured products appear prominently on the site</p>
                  </div>

                  <div className="tw-col-span-2">
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                      Product Image
                    </label>

                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
                      <div>
                        {imageUrl ? (
                          <div className="tw-relative tw-w-full tw-h-40 tw-mb-4">
                            <img
                              src={imageUrl}
                              alt={name}
                              className="tw-object-cover tw-rounded-md tw-w-full tw-h-full"
                            />
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="tw-absolute tw-top-2 tw-right-2 tw-bg-red-600 tw-text-white tw-rounded-full tw-p-1 hover:tw-bg-red-700"
                            >
                              <svg className="tw-w-4 tw-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-md tw-p-6 tw-text-center tw-mb-4">
                            <svg
                              className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="tw-mt-1 tw-text-sm tw-text-gray-500">No image uploaded</p>
                          </div>
                        )}

                        <div className="tw-mt-1">
                          <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                            placeholder="Image URL"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                          Or upload a new image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="tw-block tw-w-full tw-text-sm tw-text-gray-500 tw-file:tw-mr-4 tw-file:tw-py-2 tw-file:tw-px-4 tw-file:tw-rounded-md tw-file:tw-border-0 tw-file:tw-text-sm tw-file:tw-font-medium tw-file:tw-bg-blue-50 tw-file:tw-text-blue-700 hover:tw-file:tw-bg-blue-100"
                        />
                        {imageFile && (
                          <p className="tw-mt-2 tw-text-sm tw-text-gray-500">
                            Selected: {imageFile.name}
                          </p>
                        )}

                        {isUploading && (
                          <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2.5 tw-mt-2">
                            <div
                              className="tw-bg-blue-600 tw-h-2.5 tw-rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Settings Tab */}
            {activeTab === 'seo' && (
              <div>
                <div className="tw-mb-6">
                  <h2 className="tw-text-lg tw-font-medium tw-mb-2">Search Engine Optimization</h2>
                  <p className="tw-text-sm tw-text-gray-500 tw-mb-4">
                    These settings will affect how your product appears in search engine results.
                  </p>

                  <div className="tw-grid tw-grid-cols-1 tw-gap-6">
                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                        placeholder="Enter meta title (recommended: 50-60 characters)"
                      />
                      <p className="tw-mt-1 tw-text-xs tw-text-gray-500">
                        Characters: {metaTitle.length}/60
                        {metaTitle.length > 60 && (
                          <span className="tw-text-red-500"> (too long)</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
                        Meta Description
                      </label>
                      <textarea
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        rows={4}
                        className="tw-block tw-w-full tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm tw-px-4 tw-py-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
                        placeholder="Enter meta description (recommended: 150-160 characters)"
                      ></textarea>
                      <p className="tw-mt-1 tw-text-xs tw-text-gray-500">
                        Characters: {metaDescription.length}/160
                        {metaDescription.length > 160 && (
                          <span className="tw-text-red-500"> (too long)</span>
                        )}
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
                      <p className="tw-mt-1 tw-text-xs tw-text-gray-500">
                        Example: art, painting, modern art, canvas
                      </p>
                    </div>
                  </div>
                </div>

                <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md tw-mb-6">
                  <h3 className="tw-text-md tw-font-medium tw-mb-2">SEO Preview</h3>
                  <div className="tw-p-4 tw-border tw-border-gray-200 tw-rounded-md tw-bg-white">
                    <div className="tw-text-xl tw-text-blue-800 tw-font-medium tw-mb-1">
                      {metaTitle || name || 'Product Title'}
                    </div>
                    <div className="tw-text-green-700 tw-text-sm tw-mb-1">
                      {`https://example.com/product/${id}`}
                    </div>
                    <div className="tw-text-gray-600 tw-text-sm">
                      {metaDescription || description?.slice(0, 160) || 'Product description will appear here...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}