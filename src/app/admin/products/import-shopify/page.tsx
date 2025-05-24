'use client';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import ClientOnlyWrapper from '@/components/admin/ClientOnlyWrapper';
import { FaCloudUploadAlt, FaFileUpload, FaCheckCircle, FaExclamationTriangle, FaDownload } from 'react-icons/fa';
import { productImportService, ImportStats, ShopifyProductCSV } from '@/services/productImportService';
import Link from 'next/link';

const ImportShopifyPage: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [processingStep, setProcessingStep] = useState<'idle' | 'parsing' | 'processing' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<ImportStats>({
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
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStats({
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
    });
    setProcessingStep('parsing');
    setProgress(0);

    try {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true, // Skip empty lines in the CSV
        complete: async (results) => {
          try {
            // Log the parsed results for debugging
            console.log('CSV Parse Results:', results);
            console.log('Headers:', results.meta.fields);
            console.log('First row:', results.data[0]);

            const products = results.data as ShopifyProductCSV[];

            // Check if we have any data
            if (!products || products.length === 0) {
              throw new Error('No data found in CSV file. Please check the file format.');
            }

            // Check if we have the required headers for Shopify format
            // Shopify exports can have different header formats, so we need to be flexible
            const availableHeaders = results.meta.fields || [];
            console.log('Available headers:', availableHeaders);

            // Check if this is a standard format instead of Shopify format
            if (availableHeaders.includes('name') && availableHeaders.includes('price') && !availableHeaders.includes('Handle')) {
              // This appears to be a standard format CSV, not Shopify format
              toast.info('Detected standard CSV format. Redirecting to Standard import page...');
              setTimeout(() => {
                window.location.href = '/admin/products/import';
              }, 1500);
              throw new Error('This appears to be a standard format CSV, not Shopify format. Please use the Standard Import page instead.');
            }

            // For Shopify format, we'll accept any of these combinations:
            // 1. Has 'Handle' and 'Title'
            // 2. Has 'Handle' and 'Variant Price'
            // 3. Has 'Handle' and 'Variant SKU'

            const hasHandle = availableHeaders.includes('Handle');
            const hasTitle = availableHeaders.includes('Title');
            const hasVariantPrice = availableHeaders.includes('Variant Price');
            const hasVariantSKU = availableHeaders.includes('Variant SKU');

            if (!hasHandle) {
              throw new Error('CSV file is missing the required "Handle" column. Please check the file format.');
            }

            if (!hasTitle && !hasVariantPrice && !hasVariantSKU) {
              throw new Error('CSV file is missing required Shopify columns. It must have either "Title", "Variant Price", or "Variant SKU" columns in addition to "Handle".');
            }

            // If we get here, we have a valid Shopify format
            console.log('Detected valid Shopify format CSV');

            // Filter out empty rows and rows without required fields
            const validProducts = products.filter(product => {
              // Check if the product has any data
              if (!product || Object.keys(product).length === 0) return false;

              // For Shopify exports with variations, we need to be more flexible
              // A valid product can be:
              // 1. A product with Handle and Title (main product)
              // 2. A variation with Handle but no Title (uses parent's title)
              // 3. A product with Variant Price or Variant SKU (variation)

              // Check if it's a main product
              if (product.Handle && product.Title) return true;

              // Check if it's a variation (has Handle but no Title)
              if (product.Handle && !product.Title) return true;

              // Check if it has variation data
              if (product['Variant Price'] || product['Variant SKU']) return true;

              // If none of the above, it's not a valid product
              return false;
            });

            console.log('Valid Shopify products found:', validProducts.length);

            if (validProducts.length === 0) {
              throw new Error('No valid products found in CSV file. Products must have at least a Handle and Title.');
            }

            // Process products
            setProcessingStep('processing');
            const importStats = await productImportService.processProducts(
              validProducts,
              (progress, currentStats) => {
                setProgress(progress);
                setStats(currentStats);
              }
            );

            setProcessingStep('complete');

            // Show success message
            if (importStats.productsCreated > 0 || importStats.productsUpdated > 0) {
              toast.success(`Successfully processed ${importStats.productsCreated + importStats.productsUpdated} products`);

              // Redirect to products page after 2 seconds to see the imported products
              setTimeout(() => {
                window.location.href = '/admin/products';
              }, 2000);
            }

            // Show warning if there were errors
            if (importStats.errors.length > 0) {
              toast.warning(`Completed with ${importStats.errors.length} errors. Check the error log for details.`);
            }
          } catch (error) {
            console.error('Error processing CSV:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process CSV file');
            setProcessingStep('idle');
          } finally {
            setUploading(false);

            // Reset the file input to allow re-uploading the same file
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        },
        error: (error) => {
          setUploading(false);
          toast.error(`Error parsing CSV: ${error.message}`);
          setProcessingStep('idle');
        }
      });
    } catch (error) {
      setUploading(false);
      toast.error(`Error processing file: ${error instanceof Error ? error.message : String(error)}`);
      setProcessingStep('idle');
    }
  };

  const downloadTemplateFile = () => {
    // Create a link to download the template file
    const link = document.createElement('a');
    link.href = '/templates/products_export_1.csv';
    link.download = 'shopify_product_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ClientOnlyWrapper fallback={<div>Loading...</div>}>
      <AdminLayout>
        <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <h1 className="tw-text-3xl tw-font-bold">Import Shopify Products</h1>
          <Link
            href="/admin/products/import"
            className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-blue-700"
          >
            Standard Import
          </Link>
        </div>

        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6 tw-mb-8">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">Shopify CSV Import</h2>

          <p className="tw-mb-4 tw-text-gray-600">
            Upload a CSV file exported from Shopify with product data. The system will automatically:
          </p>

          <ul className="tw-list-disc tw-pl-5 tw-mb-6 tw-text-gray-600">
            <li>Create new products or update existing ones</li>
            <li>Create product variations based on size and frame options</li>
            <li>Download and upload images to Cloudinary</li>
            <li>Create categories if they don't exist</li>
          </ul>

          <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
            <button
              onClick={downloadTemplateFile}
              className="tw-flex tw-items-center tw-bg-green-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-md hover:tw-bg-green-700"
              disabled={uploading}
            >
              <FaDownload className="tw-mr-2" />
              Download Sample CSV
            </button>

            <div className="tw-flex-1 tw-ml-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={uploading}
                className="tw-block tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500"
              />
            </div>
          </div>

          {/* Progress indicator */}
          {processingStep !== 'idle' && (
            <div className="tw-mt-6">
              <div className="tw-flex tw-justify-between tw-mb-2">
                <span className="tw-text-sm tw-font-medium tw-text-gray-700">
                  {processingStep === 'parsing' && 'Parsing CSV file...'}
                  {processingStep === 'processing' && `Processing products (${progress}%)...`}
                  {processingStep === 'complete' && 'Import complete!'}
                </span>
                <span className="tw-text-sm tw-font-medium tw-text-gray-700">{progress}%</span>
              </div>
              <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2.5">
                <div
                  className="tw-bg-blue-600 tw-h-2.5 tw-rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Stats display */}
          {(processingStep === 'processing' || processingStep === 'complete') && (
            <div className="tw-mt-6 tw-grid tw-grid-cols-2 tw-gap-4">
              <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md">
                <h3 className="tw-text-lg tw-font-medium tw-mb-2">Products</h3>
                <div className="tw-grid tw-grid-cols-2 tw-gap-2">
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Total:</p>
                    <p className="tw-font-medium">{stats.totalProducts}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Created:</p>
                    <p className="tw-font-medium tw-text-green-600">{stats.productsCreated}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Updated:</p>
                    <p className="tw-font-medium tw-text-blue-600">{stats.productsUpdated}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Categories Created:</p>
                    <p className="tw-font-medium">{stats.categoriesCreated}</p>
                  </div>
                </div>
              </div>

              <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md">
                <h3 className="tw-text-lg tw-font-medium tw-mb-2">Variations</h3>
                <div className="tw-grid tw-grid-cols-2 tw-gap-2">
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Created:</p>
                    <p className="tw-font-medium tw-text-green-600">{stats.variationsCreated}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Updated:</p>
                    <p className="tw-font-medium tw-text-blue-600">{stats.variationsUpdated}</p>
                  </div>
                </div>
              </div>

              <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md">
                <h3 className="tw-text-lg tw-font-medium tw-mb-2">Images</h3>
                <div className="tw-grid tw-grid-cols-2 tw-gap-2">
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Processed:</p>
                    <p className="tw-font-medium">{stats.imagesProcessed}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Uploaded:</p>
                    <p className="tw-font-medium tw-text-green-600">{stats.imagesUploaded}</p>
                  </div>
                  <div>
                    <p className="tw-text-sm tw-text-gray-500">Failed:</p>
                    <p className="tw-font-medium tw-text-red-600">{stats.imagesFailed}</p>
                  </div>
                </div>
              </div>

              <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md">
                <h3 className="tw-text-lg tw-font-medium tw-mb-2">Status</h3>
                <div className="tw-flex tw-items-center">
                  {processingStep === 'complete' ? (
                    <FaCheckCircle className="tw-text-green-500 tw-mr-2" />
                  ) : (
                    <div className="tw-animate-spin tw-rounded-full tw-h-4 tw-w-4 tw-border-b-2 tw-border-blue-600 tw-mr-2"></div>
                  )}
                  <span>
                    {processingStep === 'complete' ? 'Import completed' : 'Processing...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error log */}
          {stats.errors.length > 0 && (
            <div className="tw-mt-6">
              <h3 className="tw-text-lg tw-font-medium tw-mb-2 tw-flex tw-items-center">
                <FaExclamationTriangle className="tw-text-yellow-500 tw-mr-2" />
                Errors ({stats.errors.length})
              </h3>
              <div className="tw-bg-red-50 tw-p-4 tw-rounded-md tw-max-h-60 tw-overflow-y-auto">
                <ul className="tw-list-disc tw-pl-5">
                  {stats.errors.map((error, index) => (
                    <li key={index} className="tw-text-red-700 tw-mb-1">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        </div>
      </AdminLayout>
    </ClientOnlyWrapper>
  );
};

export default ImportShopifyPage;
