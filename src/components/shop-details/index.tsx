

import HeaderFive from '@/layouts/headers/HeaderFive';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import ShopDetailsArea from './ShopDetailsArea';
import OurProductArea from './OurProductArea';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';

const ShopDetails = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Shop Details' subtitle='Shop Details' />
            <ShopDetailsArea />
            <OurProductArea />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>

    </>
  );
};

export default ShopDetails;