
import React from 'react';
import HeaderOne from '@/layouts/headers/HeaderOne';
import HeroAreaHomeOne from './HeroAreaHomeOne';
import ServiceAreaHomeOne from './ServiceAreaHomeOne';
import AboutAreaHomeOne from './AboutAreaHomeOne';
import FunFactAreaHomeOne from './FunFactAreaHomeOne';
import TestimonialAreaHomeOne from './TestimonialAreaHomeOne';
import ProjectAreaHomeOne from './ProjectAreaHomeOne';
import ProductAreaHomeOne from './ProductAreaHomeOne';
import BlogAreaHomeOne from './BlogAreaHomeOne';
import BrandAreaHomeOne from './BrandAreaHomeOne';
import ContactAreaHomeOne from './ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';

const HomeOne = () => {
  return (
    <>
      <HeaderOne />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroAreaHomeOne />
            <ServiceAreaHomeOne />
            <AboutAreaHomeOne style_2={false} />
            <FunFactAreaHomeOne style_2={false} />
            <TestimonialAreaHomeOne />
            <ProjectAreaHomeOne />
            <ProductAreaHomeOne />
            <BlogAreaHomeOne />
            <BrandAreaHomeOne />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default HomeOne;