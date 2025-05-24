'use client'

import React from 'react';
import ProductHeader from '@/layouts/headers/ProductHeader';
import ProductBreadcrumb from '../common/ProductBreadcrumb';
import ShopDetailsArea from '../shop-details/ShopDetailsArea';
import OurProductArea from '../shop-details/OurProductArea';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterThree from '@/layouts/footers/FooterThree';
import FloatingCartButton from '@/components/common/FloatingCartButton';

const ProductDetails = () => {
  return (
    <>
      <ProductHeader />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <ProductBreadcrumb />
            <ShopDetailsArea />
            <OurProductArea />
            <ContactAreaHomeOne />
          </main>
          <FooterThree />
        </div>
      </div>
      <FloatingCartButton />
    </>
  );
};

export default ProductDetails;
