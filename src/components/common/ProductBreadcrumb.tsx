'use client'

import Link from 'next/link';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetSingleProductQuery } from '@/redux/features/productApi';

const ProductBreadcrumb = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');
  
  const { data, isLoading } = useGetSingleProductQuery(productId);
  const product = data?.product;

  // Fallback product title if API fails or is loading
  const productTitle = isLoading ? 'Loading...' : (product?.title || 'Product Details');
  
  return (
    <>
      <div className="breadcrumb__pt">
        <div className="breadcrumb__area breadcrumb__overlay breadcrumb__height p-relative fix"
          style={{ backgroundImage: 'url(/assets/img/breadcurmb/breadcurmb.jpg)' }}>
          <div className="container">
            <div className="row">
              <div className="col-xxl-12">
                <div className="breadcrumb__content z-index">
                  <div className="breadcrumb__section-title-box mb-20">
                    <h3 className="breadcrumb__title tp-split-text tp-split-in-right">{productTitle}</h3>
                  </div>
                  <div className="breadcrumb__list">
                    <span><Link href="/">Home</Link></span>
                    <span className="dvdr"><i className="fa-solid fa-angle-right"></i></span>
                    <span>Product Details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductBreadcrumb;
