
'use client';

import React, { useEffect, useState } from 'react';
import Breadcrumb from '../common/Breadcrumb';
import FooterOne from '@/layouts/footers/FooterOne';
import HeaderFive from '@/layouts/headers/HeaderFive';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import ProductArea from './ProductArea';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/shop-page.css';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Shop component mounted');

    const fetchProducts = async () => {
      try {
        console.log('Shop: Fetching products...');
        const response = await fetch('/api/products/show');
        console.log('Shop: Response status:', response.status);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Shop: Data received:', data);

        if (data.products && Array.isArray(data.products)) {
          console.log('Shop: Setting products, count:', data.products.length);
          setProducts(data.products);
        } else {
          setError('Invalid data format');
        }
      } catch (err) {
        console.error('Shop: Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Shop' subtitle='Shop' />
            <ProductArea />
            <ContactAreaHomeOne />
          </main>
        </div>
      </div>
    </>
  );
};

export default Shop;