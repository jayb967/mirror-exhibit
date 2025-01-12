

import React from 'react';
import HeaderFour from '@/layouts/headers/HeaderFour';
import FooterFive from '@/layouts/footers/FooterFive';
import HeroAreaHomeFive from '../../multi-page/home-5/HeroAreaHomeFive';
import AboutAreaHomeFive from '../../multi-page/home-5/AboutAreaHomeFive';
import TeamAreaHomeFive from '../../multi-page/home-5/TeamAreaHomeFive';
import BrandAreaHomeFive from '../../multi-page/home-5/BrandAreaHomeFive';
import BlogAreaHomeFive from '../../multi-page/home-5/BlogAreaHomeFive';
import ServiceAreaHomeFive from '../../multi-page/home-5/ServiceAreaHomeFive';
import FunFactAreaHomeFive from '../../multi-page/home-5/FunFactAreaHomeFive';
import ProjectAreaHomeFive from '../../multi-page/home-5/ProjectAreaHomeFive';
import ProgressAreaHomeFive from '../../multi-page/home-5/ProgressAreaHomeFive';
import NewsletterAreaHomeFive from '../../multi-page/home-5/NewsletterAreaHomeFive';
import TestimonialAreaHomeFive from '../../multi-page/home-5/TestimonialAreaHomeFive';

const HomeFiveOnePage = () => {
  return (
    <>
      <HeaderFour onePageHomeFive={true} />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroAreaHomeFive />
            <ServiceAreaHomeFive />
            <AboutAreaHomeFive />
            <FunFactAreaHomeFive />
            <ProjectAreaHomeFive />
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

export default HomeFiveOnePage;