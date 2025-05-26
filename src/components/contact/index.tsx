

import React from 'react';
import ContactArea from './ContactArea';
import Breadcrumb from '../common/Breadcrumb';
import BrandAreaHomeOne from '../homes/multi-page/home-3/BrandAreaHomeOne';

const Contact = () => {
  return (
    <>
      <Breadcrumb title='Contact Us' subtitle='Contact Us' />
      <ContactArea />
      <BrandAreaHomeOne bg_style={true} />
    </>
  );
};

export default Contact;