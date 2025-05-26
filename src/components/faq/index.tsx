

import HeaderFive from '@/layouts/headers/HeaderFour';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import FaqArea from './FaqArea';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterThree from '@/layouts/footers/FooterThree';

const Faq = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='faq' subtitle='faq' />
            <FaqArea />
            <ContactAreaHomeOne />
          </main>
          <FooterThree />
        </div>
      </div>
    </>
  );
};

export default Faq;