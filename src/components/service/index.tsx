
import HeaderFive from '@/layouts/headers/HeaderFive';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import SeerviceArea from './SeerviceArea';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';
import PricingArea from './PricingArea';

const Service = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title="Service" subtitle="Service" />
            <SeerviceArea />
            <PricingArea />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>

    </>
  );
};

export default Service;