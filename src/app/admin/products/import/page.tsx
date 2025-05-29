'use client';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';

export default function ImportProductsPage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [components, setComponents] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic imports inside the client component
  useEffect(() => {
    const loadComponents = async () => {
      const [
        Papa,
        { FaCloudUploadAlt, FaFileUpload, FaCheckCircle, FaExclamationTriangle, FaDownload },
        { productImportService }
      ] = await Promise.all([
        import('papaparse'),
        import('react-icons/fa'),
        import('@/services/productImportService')
      ]);

      setComponents({
        Papa: Papa.default,
        FaCloudUploadAlt,
        FaFileUpload,
        FaCheckCircle,
        FaExclamationTriangle,
        FaDownload,
        productImportService
      });
    };

    loadComponents();
  }, []);

  const downloadTemplateFile = () => {
    // Create a sample CSV content
    const csvContent = `Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Option3 Name,Option3 Value,Variant SKU,Variant Grams,Variant Inventory Tracker,Variant Inventory Qty,Variant Inventory Policy,Variant Fulfillment Service,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Variant Barcode,Image Src,Image Position,Image Alt Text,Gift Card,SEO Title,SEO Description,Google Shopping / Google Product Category,Google Shopping / Gender,Google Shopping / Age Group,Google Shopping / MPN,Google Shopping / AdWords Grouping,Google Shopping / AdWords Labels,Google Shopping / Condition,Google Shopping / Custom Product,Google Shopping / Custom Label 0,Google Shopping / Custom Label 1,Google Shopping / Custom Label 2,Google Shopping / Custom Label 3,Google Shopping / Custom Label 4,Variant Image,Variant Weight Unit,Variant Tax Code,Cost per item,Status
sample-mirror-product,"Sample Mirror Product","<p>This is a sample mirror product for import testing.</p>",MirrorExhibit,Mirrors,Mirrors,"mirror, home decor, wall art",true,Size,"Small - 12"" x 12""",Frame,Classic Wood,,,SAMPLE-SMALL-WOOD,0,shopify,10,deny,manual,139.00,189.00,true,true,,https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop,1,"Sample mirror product",false,"Sample Mirror Product - Small Classic Wood","Beautiful sample mirror product perfect for any room","Home & Garden > Decor > Mirrors",,,,,,new,false,,,,,,,lb,,42.00,active
sample-mirror-product,"Sample Mirror Product","<p>This is a sample mirror product for import testing.</p>",MirrorExhibit,Mirrors,Mirrors,"mirror, home decor, wall art",true,Size,"Medium - 18"" x 18""",Frame,Classic Wood,,,SAMPLE-MEDIUM-WOOD,0,shopify,8,deny,manual,189.00,239.00,true,true,,https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop,1,"Sample mirror product",false,"Sample Mirror Product - Medium Classic Wood","Beautiful sample mirror product perfect for any room","Home & Garden > Decor > Mirrors",,,,,,new,false,,,,,,,lb,,52.00,active`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !components) return;

    const { Papa, productImportService } = components;

    setUploading(true);
    setProgress(0);
    setStats(null);
    setErrors([]);

    try {
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results: any) => {
          try {
            console.log('CSV parsed, rows:', results.data.length);

            if (results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors);
              setErrors(results.errors.map((err: any) => `Row ${err.row}: ${err.message}`));
            }

            if (results.data.length === 0) {
              toast.error('No valid data found in CSV file');
              return;
            }

            // Process products using the import service
            const finalStats = await productImportService.processProducts(
              results.data,
              (progressPercent: number, currentStats: any) => {
                setProgress(progressPercent);
                setStats(currentStats);
              }
            );

            setStats(finalStats);

            if (finalStats.errors.length > 0) {
              setErrors(finalStats.errors);
            }

            if (finalStats.productsCreated > 0 || finalStats.productsUpdated > 0) {
              toast.success(`Import completed! Created: ${finalStats.productsCreated}, Updated: ${finalStats.productsUpdated}`);
            } else {
              toast.warning('Import completed but no products were processed');
            }

          } catch (error) {
            console.error('Error processing products:', error);
            toast.error('Failed to process products');
            setErrors([error instanceof Error ? error.message : 'Unknown error occurred']);
          }
        },
        error: (error: any) => {
          console.error('CSV parsing error:', error);
          toast.error('Failed to parse CSV file');
          setErrors([error.message || 'Failed to parse CSV file']);
        }
      });
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV file');
      setErrors([error instanceof Error ? error.message : 'Unknown error occurred']);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!components) {
    return (
      <SimpleAdminLayout>
        <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2" style={{ borderColor: '#A6A182' }}></div>
        </div>
      </SimpleAdminLayout>
    );
  }

  const { FaCloudUploadAlt, FaFileUpload, FaCheckCircle, FaExclamationTriangle, FaDownload } = components;

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-mb-6">
          <h1 className="tw-text-3xl tw-font-bold tw-mb-2">Import Products</h1>
          <p className="tw-text-gray-600">
            Upload a CSV file to import products. The CSV should be in Shopify export format.
          </p>
        </div>

        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6">
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

          {uploading && (
            <div className="tw-mb-6">
              <div className="tw-flex tw-items-center tw-mb-2">
                <FaCloudUploadAlt className="tw-mr-2 tw-text-blue-500" />
                <span className="tw-font-medium">Processing CSV file...</span>
              </div>
              <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2">
                <div
                  className="tw-bg-blue-600 tw-h-2 tw-rounded-full tw-transition-all tw-duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="tw-text-sm tw-text-gray-600 tw-mt-1">{progress}% complete</div>
            </div>
          )}

          {stats && (
            <div className="tw-mb-6">
              <h3 className="tw-text-lg tw-font-semibold tw-mb-3 tw-flex tw-items-center">
                <FaCheckCircle className="tw-mr-2 tw-text-green-500" />
                Import Statistics
              </h3>
              <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4">
                <div className="tw-bg-blue-50 tw-p-3 tw-rounded-md">
                  <div className="tw-text-2xl tw-font-bold tw-text-blue-600">{stats.totalProducts}</div>
                  <div className="tw-text-sm tw-text-gray-600">Total Products</div>
                </div>
                <div className="tw-bg-green-50 tw-p-3 tw-rounded-md">
                  <div className="tw-text-2xl tw-font-bold tw-text-green-600">{stats.productsCreated}</div>
                  <div className="tw-text-sm tw-text-gray-600">Created</div>
                </div>
                <div className="tw-bg-yellow-50 tw-p-3 tw-rounded-md">
                  <div className="tw-text-2xl tw-font-bold tw-text-yellow-600">{stats.productsUpdated}</div>
                  <div className="tw-text-sm tw-text-gray-600">Updated</div>
                </div>
                <div className="tw-bg-purple-50 tw-p-3 tw-rounded-md">
                  <div className="tw-text-2xl tw-font-bold tw-text-purple-600">{stats.imagesProcessed}</div>
                  <div className="tw-text-sm tw-text-gray-600">Images Processed</div>
                </div>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="tw-mb-6">
              <h3 className="tw-text-lg tw-font-semibold tw-mb-3 tw-flex tw-items-center tw-text-red-600">
                <FaExclamationTriangle className="tw-mr-2" />
                Errors ({errors.length})
              </h3>
              <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-md tw-p-4 tw-max-h-64 tw-overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="tw-text-sm tw-text-red-700 tw-mb-1">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="tw-bg-gray-50 tw-p-4 tw-rounded-md">
            <h3 className="tw-font-semibold tw-mb-2">CSV Format Requirements:</h3>
            <ul className="tw-text-sm tw-text-gray-600 tw-space-y-1">
              <li>• Use Shopify product export format</li>
              <li>• Include columns: Handle, Title, Body (HTML), Vendor, etc.</li>
              <li>• Each product variation should be on a separate row</li>
              <li>• Images should be accessible URLs</li>
              <li>• Download the sample CSV above for the correct format</li>
            </ul>
          </div>
        </div>
      </div>
    </SimpleAdminLayout>
  );
}
