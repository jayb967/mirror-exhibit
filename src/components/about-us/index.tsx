
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import FooterThree from '@/layouts/footers/FooterThree';
import HeaderFive from '@/layouts/headers/HeaderFive';
import AboutAreaHomeOne from '../homes/multi-page/home-3/AboutAreaHomeOne';
import FunFactAreaHomeOne from '../homes/multi-page/home-3/FunFactAreaHomeOne';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import TestimonialAreaHomeOne from '../homes/multi-page/home-3/TestimonialAreaHomeOne';

const AboutUs = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title="About Us" subtitle="About Us" />
            <AboutAreaHomeOne style_2={true} />
            <FunFactAreaHomeOne style_2={true} />
            <TestimonialAreaHomeOne />
            <ContactAreaHomeOne />
          </main>
          <FooterThree />
        </div>
      </div>

    </>
  );
};

export default AboutUs;