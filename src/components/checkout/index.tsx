

import React from 'react';
import HeaderFive from '@/layouts/headers/HeaderFive';
import Breadcrumb from '../common/Breadcrumb';
import FooterThree from '@/layouts/footers/FooterThree';
import CheckoutArea from './CheckoutArea';

const Checkout = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Checkout' subtitle='Checkout' />
            <CheckoutArea />
          </main>
          <FooterThree />
        </div>
      </div>
    </>
  );
};

export default Checkout;