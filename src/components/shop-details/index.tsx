

import HeaderFour from '@/layouts/headers/HeaderFour';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import ShopDetailsArea from './ShopDetailsArea';
import OurProductArea from './OurProductArea';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterThree from '@/layouts/footers/FooterThree';

const ShopDetails = () => {
  return (
    <>
      <HeaderFour />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Shop Details' subtitle='Shop Details' />
            <ShopDetailsArea />
            <OurProductArea />
            <ContactAreaHomeOne />
          </main>
          <FooterThree />
        </div>
      </div>

    </>
  );
};

export default ShopDetails;