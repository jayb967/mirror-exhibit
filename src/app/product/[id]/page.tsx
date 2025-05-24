'use client'

import ProductDetails from '@/components/product';
import Wrapper from '@/layouts/Wrapper';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProductPageProps {
  params: {
    id: string;
  };
}

const ProductPage = ({ params }: ProductPageProps) => {
  const router = useRouter();
  const { id } = params;

  // Redirect to the product page with the ID as a query parameter
  useEffect(() => {
    // This is needed because our API expects the ID as a query parameter
    router.replace(`/product/${id}?id=${id}`);
  }, [id, router]);

  return (
    <Wrapper>
      <ProductDetails />
    </Wrapper>
  );
};

export default ProductPage;
