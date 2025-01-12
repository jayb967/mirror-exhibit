

import React from 'react';
import ContactArea from './ContactArea'; 
import Breadcrumb from '../common/Breadcrumb';
import HeaderFive from '@/layouts/headers/HeaderFive';
import BrandAreaHomeOne from '../homes/multi-page/home-3/BrandAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';

const Contact = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Contact Us' subtitle='Contact Us' />
            <ContactArea /> 
            <BrandAreaHomeOne bg_style={true} />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default Contact;