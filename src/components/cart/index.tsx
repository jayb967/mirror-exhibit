

import React from 'react';
import Breadcrumb from '../common/Breadcrumb'; 
import ShoppingBagArea from './ShoppingBagArea';
import FooterOne from '@/layouts/footers/FooterOne';
import HeaderFive from '@/layouts/headers/HeaderFive';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';

const Cart = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Cart Page' subtitle='Cart Page' /> 
            <ShoppingBagArea />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default Cart;