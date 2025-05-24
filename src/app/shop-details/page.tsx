
'use client'

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const ShopDetailsRedirect = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get('id');

  useEffect(() => {
    if (productId) {
      // Redirect to the new product URL
      router.replace(`/product/${productId}`);
    } else {
      // If no product ID, redirect to the shop page
      router.replace('/shop');
    }
  }, [productId, router]);

  return (
    <div className="container py-5 text-center">
      <h2>Redirecting...</h2>
      <p>Please wait while we redirect you to the product page.</p>
    </div>
  );
};

export default ShopDetailsRedirect;