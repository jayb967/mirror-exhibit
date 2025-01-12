

import HeaderFive from '@/layouts/headers/HeaderFive';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import ServiceDetailsArea from './ServiceDetailsArea';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';

const ServiceDetails = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Service Details' subtitle='Service Details' />
            <ServiceDetailsArea />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default ServiceDetails;