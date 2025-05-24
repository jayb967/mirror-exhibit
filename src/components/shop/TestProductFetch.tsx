'use client'

import React, { useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

const TestProductFetch = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('TestProductFetch component mounted');

    const fetchProducts = async () => {
      try {
        console.log('TestProductFetch: Fetching products...');
        const response = await fetch('/api/products/show');
        console.log('TestProductFetch: Response status:', response.status);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('TestProductFetch: Data received:', data);

        if (data.products && Array.isArray(data.products)) {
          console.log('TestProductFetch: Setting products, count:', data.products.length);
          setProducts(data.products);
        } else {
          setError('Invalid data format');
        }
      } catch (err) {
        console.error('TestProductFetch: Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container my-5">
      <h2>Test Product Fetch</h2>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading products...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <p>Found {products.length} products</p>

          {products.length > 0 ? (
            <div className="row">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="col-md-4 mb-4">
                  <div className="card">
                    <img
                      src={product.image || '/assets/img/logo/ME_Logo.png'}
                      className="card-img-top"
                      alt={product.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{product.title}</h5>
                      <p className="card-text">${product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No products found</p>
          )}
        </>
      )}
    </div>
  );
};

export default TestProductFetch;
