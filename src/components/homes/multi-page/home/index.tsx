

import React from 'react';
import HeaderFour from '@/layouts/headers/HeaderFour';
import HeroAreaHomeThree from './HeroAreaHomeFive';
import ServiceAreaHomeThree from './ServiceAreaHomeThree';
import AboutAreaHomeThree from './AboutAreaHomeThree';
import FunFactAreaHomeThree from './FunFactAreaHomeThree';
import FeatureAreaHomeThree from './FeatureAreaHomeThree';
import GalleryAreaHomeThree from './GalleryAreaHomeThree';
import TeamAreaHomeThree from './TeamAreaHomeThree';
import TestimonialAreaHomeTwo from './TestimonialAreaHomeTwo';
import ExpartFeatureAreaHomeThree from './ExpartFeatureAreaHomeThree';
import ProductAreaHomeFour from './ProductAreaHomeFour';
import BlogAreaHomeThree from './BlogAreaHomeThree';
import NewsletterAreaHomeThree from './NewsletterAreaHomeThree';
import FooterThree from '@/layouts/footers/FooterThree';

const HomeThree = () => {
  return (
    <>
      <HeaderFour />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroAreaHomeThree />
            <ServiceAreaHomeThree />
            <ProductAreaHomeFour />
            <AboutAreaHomeThree />
            <FunFactAreaHomeThree />
            <FeatureAreaHomeThree />
            {/* <GalleryAreaHomeThree />  TODO: ADD THIS LATER TO THE CMS!*/} 
            {/* <TeamAreaHomeThree /> */}
            <ExpartFeatureAreaHomeThree />
            <TestimonialAreaHomeTwo />
            <ProductAreaHomeFour />
            {/* <BlogAreaHomeThree /> */}
            <NewsletterAreaHomeThree />
          </main>
          <FooterThree />
        </div>
      </div>

    </>
  );
};

export default HomeThree;

