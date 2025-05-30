'use client';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';


import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/utils/supabase-client';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import { toast } from 'react-toastify';

interface Size {
  id: string;
  name: string;
  dimensions?: string;
  code?: string;
  price_adjustment?: number;
  is_active?: boolean;
  created_at?: string;
}

interface FrameType {
  id: string;
  name: string;
  material?: string;
  color?: string;
  description?: string;
  price_adjustment?: number;
  is_active?: boolean;
  created_at?: string;
}

export default function ProductOptionsPage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [frameTypes, setFrameTypes] = useState<FrameType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sizes');
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [editingFrameType, setEditingFrameType] = useState<FrameType | null>(null);

  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch sizes - order by price_adjustment to ensure Small (0) comes first
      const { data: sizesData, error: sizesError } = await supabase
        .from('product_sizes')
        .select('*')
        .order('price_adjustment', { ascending: true })
        .order('name', { ascending: true });

      if (sizesError) throw sizesError;
      setSizes(sizesData || []);

      // Fetch frame types
      const { data: frameTypesData, error: frameTypesError } = await supabase
        .from('frame_types')
        .select('*')
        .order('name');

      if (frameTypesError) throw frameTypesError;
      setFrameTypes(frameTypesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load product options');
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for sizes
  const handleEditSize = (size: Size) => {
    setEditingSize(size);
    // You can implement a modal or inline editing here
    const newName = prompt('Edit size name:', size.name);
    if (newName && newName !== size.name) {
      updateSize(size.id, { name: newName });
    }
  };

  const handleDeleteSize = async (sizeId: string) => {
    if (confirm('Are you sure you want to delete this size?')) {
      try {
        const { error } = await supabase
          .from('product_sizes')
          .delete()
          .eq('id', sizeId);

        if (error) throw error;

        toast.success('Size deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting size:', error);
        toast.error('Failed to delete size');
      }
    }
  };

  const updateSize = async (sizeId: string, updates: Partial<Size>) => {
    try {
      const { error } = await supabase
        .from('product_sizes')
        .update(updates)
        .eq('id', sizeId);

      if (error) throw error;

      toast.success('Size updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating size:', error);
      toast.error('Failed to update size');
    }
  };

  // Handler functions for frame types
  const handleEditFrameType = (frameType: FrameType) => {
    setEditingFrameType(frameType);
    const newName = prompt('Edit frame type name:', frameType.name);
    if (newName && newName !== frameType.name) {
      updateFrameType(frameType.id, { name: newName });
    }
  };

  const handleDeleteFrameType = async (frameTypeId: string) => {
    if (confirm('Are you sure you want to delete this frame type?')) {
      try {
        const { error } = await supabase
          .from('frame_types')
          .delete()
          .eq('id', frameTypeId);

        if (error) throw error;

        toast.success('Frame type deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting frame type:', error);
        toast.error('Failed to delete frame type');
      }
    }
  };

  const updateFrameType = async (frameTypeId: string, updates: Partial<FrameType>) => {
    try {
      const { error } = await supabase
        .from('frame_types')
        .update(updates)
        .eq('id', frameTypeId);

      if (error) throw error;

      toast.success('Frame type updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating frame type:', error);
      toast.error('Failed to update frame type');
    }
  };

  const renderSizesTab = () => (
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
        <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
          <thead className="tw-bg-gray-50">
            <tr>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Name</th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Code</th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Dimensions</th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Price Adjustment</th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
            {sizes.length === 0 ? (
              <tr>
                <td colSpan={5} className="tw-px-6 tw-py-4 tw-text-center tw-text-sm tw-text-gray-500">
                  No sizes found. Use the &quot;Set Up Default Options&quot; button to create default sizes.
                </td>
              </tr>
            ) : (
              sizes.map((size) => (
                <tr key={size.id}>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900">{size.name}</td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">{size.code}</td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">{size.dimensions}</td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">${size.price_adjustment?.toFixed(2) || '0.00'}</td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                    <div className="tw-flex tw-space-x-2">
                      <button
                        onClick={() => handleEditSize(size)}
                        className="tw-bg-black tw-text-white tw-px-3 tw-py-1 tw-text-xs hover:tw-bg-gray-800 tw-transition-colors"
                        title="Edit Size"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteSize(size.id)}
                        className="tw-bg-red-600 tw-text-white tw-px-3 tw-py-1 tw-text-xs hover:tw-bg-red-700 tw-transition-colors"
                        title="Delete Size"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFrameTypesTab = () => (
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
        <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
          <thead className="tw-bg-gray-50">
            <tr>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Name</th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Material</th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Color</th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Price Adjustment</th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
            {frameTypes.length === 0 ? (
              <tr>
                <td colSpan={5} className="tw-px-6 tw-py-4 tw-text-center tw-text-sm tw-text-gray-500">
                  No frame types found. Use the &quot;Set Up Default Options&quot; button to create default frame types.
                </td>
              </tr>
            ) : (
              frameTypes.map((frameType) => (
                <tr key={frameType.id}>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900">{frameType.name}</td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">{frameType.material}</td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">{frameType.color}</td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">${frameType.price_adjustment?.toFixed(2) || '0.00'}</td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                    <div className="tw-flex tw-space-x-2">
                      <button
                        onClick={() => handleEditFrameType(frameType)}
                        className="tw-bg-black tw-text-white tw-px-3 tw-py-1 tw-text-xs hover:tw-bg-gray-800 tw-transition-colors"
                        title="Edit Frame Type"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteFrameType(frameType.id)}
                        className="tw-bg-red-600 tw-text-white tw-px-3 tw-py-1 tw-text-xs hover:tw-bg-red-700 tw-transition-colors"
                        title="Delete Frame Type"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const setupDefaultOptions = async () => {
    try {
      const response = await fetch('/api/admin/setup-default-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to set up default options');
      }

      toast.success('Default options set up successfully');
      fetchData(); // Refresh the data

    } catch (error) {
      console.error('Error setting up default options:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to set up default options');
    }
  };

  const createProductVariations = async () => {
    try {
      const response = await fetch('/api/admin/create-product-variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product variations');
      }

      toast.success(`Product variations created successfully: ${result.variations_created} variations for ${result.products_processed} products`);

    } catch (error) {
      console.error('Error creating product variations:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create product variations');
    }
  };

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <h1 className="tw-text-3xl tw-font-bold">Product Options</h1>
          <div className="tw-flex tw-space-x-2">
            <button
              onClick={setupDefaultOptions}
              className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800 tw-transition-colors"
            >
              Set Up Default Options
            </button>
            <button
              onClick={createProductVariations}
              className="tw-bg-[#A6A182] tw-text-white tw-px-4 tw-py-2 hover:tw-bg-[#8F8A6F] tw-transition-colors"
            >
              Create Product Variations
            </button>
          </div>
        </div>

        <div className="tw-mb-6">
          <div className="tw-border-b tw-border-gray-200">
            <nav className="tw-flex tw-space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('sizes')}
                className={`tw-py-4 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                  activeTab === 'sizes'
                    ? 'tw-border-[#A6A182] tw-text-[#A6A182]'
                    : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                }`}
              >
                Sizes
              </button>
              <button
                onClick={() => setActiveTab('frameTypes')}
                className={`tw-py-4 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                  activeTab === 'frameTypes'
                    ? 'tw-border-[#A6A182] tw-text-[#A6A182]'
                    : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
                }`}
              >
                Frame Types
              </button>
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent tw-rounded-full"></div>
          </div>
        ) : (
          <>
            {activeTab === 'sizes' && renderSizesTab()}
            {activeTab === 'frameTypes' && renderFrameTypesTab()}
          </>
        )}
      </div>
    </SimpleAdminLayout>
  );
}
