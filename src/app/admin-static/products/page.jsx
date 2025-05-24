'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { usePathname } from 'next/navigation';
import StaticNavigation from '@/components/admin/StaticNavigation';

export default function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="tw-min-h-screen tw-bg-[#F8F8F8]">
      <ToastContainer />
      
      {/* Navigation */}
      <StaticNavigation currentPath={pathname} />
      
      {/* Main content */}
      <div className="tw-md:ml-64 tw-p-4 tw-pt-8">
        <h1 className="tw-text-3xl tw-font-bold tw-mb-8">Products</h1>
        
        {/* Add product button */}
        <div className="tw-mb-6">
          <button className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-[#A6A182]">
            Add New Product
          </button>
        </div>
        
        {loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-h-64">
            <div className="tw-animate-spin tw-w-12 tw-h-12 tw-border-4 tw-border-[#A6A182] tw-border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="tw-bg-white tw-shadow-md tw-p-6">
            <p className="tw-text-center tw-text-gray-500">No products found</p>
          </div>
        ) : (
          <div className="tw-bg-white tw-shadow-md tw-overflow-hidden">
            <div className="tw-overflow-x-auto">
              <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Product
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Price
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Stock
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Category
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <div className="tw-flex tw-items-center">
                          <div className="tw-h-10 tw-w-10 tw-bg-gray-200 tw-flex-shrink-0"></div>
                          <div className="tw-ml-4">
                            <div className="tw-text-sm tw-font-medium tw-text-gray-900">{product.name}</div>
                            <div className="tw-text-sm tw-text-gray-500">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {product.stock_quantity}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {product.category}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium">
                        <a href={`/admin-static/products/${product.id}`} className="tw-text-[#A6A182] hover:tw-text-black tw-mr-3">
                          Edit
                        </a>
                        <button className="tw-text-red-600 hover:tw-text-red-900">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
