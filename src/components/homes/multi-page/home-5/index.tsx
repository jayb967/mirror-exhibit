
import HeaderFour from '@/layouts/headers/HeaderFour';
import React from 'react';
import HeroAreaHomeFive from './HeroAreaHomeFive';
import ServiceAreaHomeFive from './ServiceAreaHomeFive';
import AboutAreaHomeFive from './AboutAreaHomeFive';
import FunFactAreaHomeFive from './FunFactAreaHomeFive';
import ProductAreaHomeFour from './ProductAreaHomeFour';
import TeamAreaHomeFive from './TeamAreaHomeFive';
import TestimonialAreaHomeFive from './TestimonialAreaHomeFive';
import ProgressAreaHomeFive from './ProgressAreaHomeFive';
import BrandAreaHomeFive from './BrandAreaHomeFive';
import BlogAreaHomeFive from './BlogAreaHomeFive';
import NewsletterAreaHomeFive from './NewsletterAreaHomeFive';
import FooterFive from '@/layouts/footers/FooterFive';

const HomeFive = () => {
  return (
    <>
      <HeaderFour />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroAreaHomeFive />
            <ServiceAreaHomeFive />
            <AboutAreaHomeFive />
            <FunFactAreaHomeFive />
            <ProductAreaHomeFour/>
            <TeamAreaHomeFive />
            <TestimonialAreaHomeFive />
            <ProgressAreaHomeFive /> 
            <BrandAreaHomeFive />
            <BlogAreaHomeFive />
            <NewsletterAreaHomeFive />
          </main>
          <FooterFive />
        </div>
      </div>
    </>
  );
};

export default HomeFive;

