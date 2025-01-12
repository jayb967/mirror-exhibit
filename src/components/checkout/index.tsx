

import React from 'react';
import HeaderFive from '@/layouts/headers/HeaderFive';
import Breadcrumb from '../common/Breadcrumb';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';
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
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default Checkout;