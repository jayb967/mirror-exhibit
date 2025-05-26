
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import AboutAreaHomeOne from '../homes/multi-page/home-3/AboutAreaHomeOne';
import FunFactAreaHomeOne from '../homes/multi-page/home-3/FunFactAreaHomeOne';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import TestimonialAreaHomeOne from '../homes/multi-page/home-3/TestimonialAreaHomeOne';

const AboutUs = () => {
  return (
    <>
      <Breadcrumb title="About Us" subtitle="About Us" />
      <AboutAreaHomeOne style_2={true} />
      <FunFactAreaHomeOne style_2={true} />
      <TestimonialAreaHomeOne />
      <ContactAreaHomeOne />
    </>
  );
};

export default AboutUs;