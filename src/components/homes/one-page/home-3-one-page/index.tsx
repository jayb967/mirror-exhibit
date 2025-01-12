

import React from 'react';
import HeaderOne from '@/layouts/headers/HeaderOne';
import FooterThree from '@/layouts/footers/FooterThree';
import BlogAreaHomeThree from '../../multi-page/home/BlogAreaHomeThree';
import HeroAreaHomeThree from '../../multi-page/home/HeroAreaHomeThree';
import TeamAreaHomeThree from '../../multi-page/home/TeamAreaHomeThree';
import AboutAreaHomeThree from '../../multi-page/home/AboutAreaHomeThree';
import FunFactAreaHomeThree from '../../multi-page/home/FunFactAreaHomeThree';
import FeatureAreaHomeThree from '../../multi-page/home/FeatureAreaHomeThree';
import GalleryAreaHomeThree from '../../multi-page/home/GalleryAreaHomeThree';
import ServiceAreaHomeThree from '../../multi-page/home/ServiceAreaHomeThree';
import ProductAreaHomeThree from '../../multi-page/home/ProductAreaHomeThree';
import NewsletterAreaHomeThree from '../../multi-page/home/NewsletterAreaHomeThree';
import ExpartFeatureAreaHomeThree from '../../multi-page/home/ExpartFeatureAreaHomeThree';

const HomeThreeOnePage = () => {
  return (
    <>
      <HeaderOne onePageHomeThree={true} />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroAreaHomeThree />
            <ServiceAreaHomeThree />
            <AboutAreaHomeThree />
            <FunFactAreaHomeThree />
            <FeatureAreaHomeThree />
            <GalleryAreaHomeThree />
            <TeamAreaHomeThree />
            <ExpartFeatureAreaHomeThree />
            <ProductAreaHomeThree />
            <BlogAreaHomeThree />
            <NewsletterAreaHomeThree />
          </main>
          <FooterThree />
        </div>
      </div>
    </>
  );
};

export default HomeThreeOnePage;