"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  base_price: number;
  stock_quantity: number;
  category: string | null;
  image_url: string | null;
  dimensions: string | null;
  material: string | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  status?: string | null; // Made optional since it might be missing in some products
  main_image_url: string | null;
  variations_count?: { count: number }[]; // Array of count objects from Supabase aggregation
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const productsPerPage = 10;

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortField, sortDirection]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Calculate range for pagination
      const from = (currentPage - 1) * productsPerPage;
      const to = from + productsPerPage - 1;

      // Build query
      let query = supabase
        .from('products')
        .select(`
          *,
          variations_count:product_variations(count)
        `, { count: 'exact' });

      // Add search filter if search term exists
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Add sorting with special handling for status field
      if (sortField === 'status') {
        // For status field, handle null values by putting them at the end
        query = query.order(sortField, {
          ascending: sortDirection === 'asc',
          nullsFirst: false // Always put nulls last regardless of sort direction
        });
      } else {
        // Normal sorting for other fields
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
      }

      // Add pagination
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setProducts(data || []);

      if (count !== null) {
        setTotalPages(Math.ceil(count / productsPerPage));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchProducts();
  };

  const handleSort = (field: string) => {
    // Special handling for status field to handle null values
    if (field === 'status') {
      // Use a custom query for status sorting
      const query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Add sorting with NULLS LAST
      if (sortField === 'status' && sortDirection === 'asc') {
        // If already sorting by status asc, toggle to desc
        setSortDirection('desc');
      } else {
        // Otherwise, set to status asc
        setSortField('status');
        setSortDirection('asc');
      }

      // Fetch products with the new sorting
      fetchProducts();
      return;
    }

    // Normal sorting for other fields
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Product deleted successfully');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const renderSortIcon = (field: string) => {
    if (field !== sortField) return null;

    return sortDirection === 'asc'
      ? <span className="tw-ml-1">↑</span>
      : <span className="tw-ml-1">↓</span>;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="tw-flex tw-justify-center tw-mt-6">
        <nav className="tw-flex tw-items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="tw-px-3 tw-py-1 tw-bg-gray-100 tw-text-gray-700 disabled:tw-opacity-50"
          >
            Previous
          </button>

          <span className="tw-mx-4 tw-text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="tw-px-3 tw-py-1 tw-bg-gray-100 tw-text-gray-700 disabled:tw-opacity-50"
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  const handleToggleProductSelection = (productId: string) => {
    setSelectedProducts(prevSelected =>
      prevSelected.includes(productId)
        ? prevSelected.filter(id => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleToggleAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    try {
      switch (bulkAction) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
            const { error } = await supabase
              .from('products')
              .delete()
              .in('id', selectedProducts);

            if (error) throw error;

            toast.success(`${selectedProducts.length} products deleted successfully`);
            fetchProducts();
            setSelectedProducts([]);
          }
          break;

        case 'feature':
          const { error: featureError } = await supabase
            .from('products')
            .update({ is_featured: true })
            .in('id', selectedProducts);

          if (featureError) throw featureError;

          toast.success(`${selectedProducts.length} products marked as featured`);
          fetchProducts();
          break;

        case 'unfeature':
          const { error: unfeatureError } = await supabase
            .from('products')
            .update({ is_featured: false })
            .in('id', selectedProducts);

          if (unfeatureError) throw unfeatureError;

          toast.success(`${selectedProducts.length} products unmarked as featured`);
          fetchProducts();
          break;

        case 'set-active':
          const { error: statusError } = await supabase
            .from('products')
            .update({ status: 'active' })
            .in('id', selectedProducts);

          if (statusError) throw statusError;

          toast.success(`${selectedProducts.length} products set to active status`);
          fetchProducts();
          break;
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
          <h1 className="tw-text-3xl tw-font-bold">Products</h1>
          <div className="tw-flex tw-space-x-2">
            <Link
              href="/admin/products/import"
              className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800 tw-transition-colors"
            >
              Import Products
            </Link>
            <Link
              href="/admin/products/new"
              className="tw-bg-[#A6A182] tw-text-white tw-px-4 tw-py-2 hover:tw-bg-[#8F8A6F] tw-transition-colors"
            >
              Add Product
            </Link>
          </div>
        </div>

        {/* Search and filters */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-4 tw-mb-6">
          <form onSubmit={handleSearch} className="tw-flex tw-flex-col md:tw-flex-row tw-gap-4">
            <div className="tw-flex-1">
              <input
                type="text"
                placeholder="Search products..."
                className="tw-w-full tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800"
            >
              Search
            </button>
          </form>
        </div>

        {/* Bulk actions */}
        {selectedProducts.length > 0 && (
          <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-4 tw-mb-6 tw-flex tw-items-center tw-justify-between">
            <div>
              <span className="tw-mr-2">{selectedProducts.length} products selected</span>
              <button
                onClick={() => setSelectedProducts([])}
                className="tw-text-[#A6A182] hover:tw-text-black tw-underline"
              >
                Clear selection
              </button>
            </div>
            <div className="tw-flex tw-items-center tw-space-x-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="tw-border tw-border-gray-300 tw-rounded-md tw-px-4 tw-py-2"
              >
                <option value="">Bulk Actions</option>
                <option value="delete">Delete</option>
                <option value="feature">Mark as Featured</option>
                <option value="unfeature">Unmark as Featured</option>
                <option value="set-active">Set Status to Active</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className={`tw-px-4 tw-py-2 tw-text-white ${
                  bulkAction ? 'tw-bg-black hover:tw-bg-gray-800' : 'tw-bg-gray-400 tw-cursor-not-allowed'
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Products table */}
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-overflow-hidden">
          {loading ? (
            <div className="tw-p-8 tw-text-center">
              <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent tw-rounded-full tw-mx-auto"></div>
              <p className="tw-mt-4 tw-text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="tw-p-8 tw-text-center">
              <p className="tw-text-gray-500">No products found</p>
            </div>
          ) : (
            <div className="tw-overflow-x-auto">
              <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={handleToggleAllProducts}
                        className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-[#A6A182] focus:tw-ring-[#A6A182]"
                      />
                    </th>
                    <th
                      className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider tw-cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="tw-flex tw-items-center">
                        Product {renderSortIcon('name')}
                      </div>
                    </th>
                    <th
                      className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider tw-cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      <div className="tw-flex tw-items-center">
                        Price {renderSortIcon('price')}
                      </div>
                    </th>
                    <th
                      className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider tw-cursor-pointer"
                      onClick={() => handleSort('stock_quantity')}
                    >
                      <div className="tw-flex tw-items-center">
                        Stock {renderSortIcon('stock_quantity')}
                      </div>
                    </th>
                    <th
                      className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider tw-cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="tw-flex tw-items-center">
                        Status {renderSortIcon('status')}
                      </div>
                    </th>
                    <th
                      className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider tw-cursor-pointer"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="tw-flex tw-items-center">
                        Created {renderSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      SEO
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:tw-bg-gray-50">
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleToggleProductSelection(product.id)}
                          className="tw-h-4 tw-w-4 tw-rounded tw-border-gray-300 tw-text-[#A6A182] focus:tw-ring-[#A6A182]"
                        />
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <div className="tw-flex tw-items-center">
                          <div className="tw-flex-shrink-0 tw-h-10 tw-w-10 tw-relative">
                            {product.main_image_url ? (
                              <Image
                                src={product.main_image_url}
                                alt={product.name}
                                fill
                                className="tw-rounded-md tw-object-cover"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="tw-h-10 tw-w-10 tw-rounded-md tw-bg-gray-200 tw-flex tw-items-center tw-justify-center">
                                <svg className="tw-w-6 tw-h-6 tw-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="tw-ml-4">
                            <div className="tw-text-sm tw-font-medium tw-text-gray-900">{product.name}</div>
                            <div className="tw-text-sm tw-text-gray-500">ID: {product.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {formatCurrency(product.base_price || product.price || 0)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        <span className={`tw-font-medium ${
                          // Check if we have variations to show stock
                          product.variations_count && product.variations_count.length > 0 ?
                            (product.variations_count[0].count > 0 ? 'tw-text-gray-900' : 'tw-text-red-600') :
                            (product.stock_quantity < 5 ? 'tw-text-red-600' : 'tw-text-gray-900')
                        }`}>
                          {product.variations_count && product.variations_count.length > 0
                            ? product.variations_count[0].count
                            : product.stock_quantity || 0}
                        </span>
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <span className={`tw-px-2 tw-inline-flex tw-text-xs tw-leading-5 tw-font-semibold tw-rounded-full ${
                          !product.status
                            ? 'tw-bg-gray-100 tw-text-gray-800' // Default style for undefined/null status
                            : product.status === 'active'
                              ? 'tw-bg-green-100 tw-text-green-800'
                              : product.status === 'draft'
                                ? 'tw-bg-gray-100 tw-text-gray-800'
                                : 'tw-bg-red-100 tw-text-red-800'
                        }`}>
                          {product.status
                            ? product.status.charAt(0).toUpperCase() + product.status.slice(1)
                            : 'Unknown'}
                        </span>
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        {product.meta_title || product.meta_description ? (
                          <span className="tw-text-green-600 tw-text-sm">
                            ✓ Set up
                          </span>
                        ) : (
                          <span className="tw-text-red-600 tw-text-sm">
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium">
                        <div className="tw-flex tw-space-x-2">
                          <Link
                            href={`/admin/products/edit/${product.id}`}
                            className="tw-text-[#A6A182] hover:tw-text-black"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="tw-text-black hover:tw-text-[#A6A182]"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {renderPagination()}
      </div>
    </SimpleAdminLayout>
  );
}