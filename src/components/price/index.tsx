

import HeaderFive from '@/layouts/headers/HeaderFive';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';
import PriceArea from './PriceArea';

const Price = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title="Pricing" subtitle='Pricing' />
            <PriceArea />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>

    </>
  );
};

export default Price;