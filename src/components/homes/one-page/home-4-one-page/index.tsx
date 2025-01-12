

import React from 'react';
import HeaderThree from '@/layouts/headers/HeaderThree';
import HeroAreaHomeFour from '../../multi-page/home-4/HeroAreaHomeFour';
import AboutAreaHOmeFour from '../../multi-page/home-4/AboutAreaHOmeFour';
import ServiceAreaHomeFour from '../../multi-page/home-4/ServiceAreaHomeFour';
import BestServiceAreaHomeThree from '../../multi-page/home-4/BestServiceAreaHomeThree';
import ProjectAreaHomeFour from '../../multi-page/home-4/ProjectAreaHomeFour';
import FunFactAreaHomeFour from '../../multi-page/home-4/FunFactAreaHomeFour';
import TeamAreaHomeTwo from '../../multi-page/home-2/TeamAreaHomeTwo';
import ProductAreaHomeFour from '../../multi-page/home-4/ProductAreaHomeFour';
import BlogAreaHomeFour from '../../multi-page/home-4/BlogAreaHomeFour';
import FooterFour from '@/layouts/footers/FooterFour';

const HomeFourOnePage = () => {
  return (
    <>
      <HeaderThree onePageHomeFour={true} />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroAreaHomeFour />
            <AboutAreaHOmeFour />
            <ServiceAreaHomeFour />
            <BestServiceAreaHomeThree />
            <ProjectAreaHomeFour />
            <FunFactAreaHomeFour />
            <TeamAreaHomeTwo style_2={true} style_team={false} />
            <ProductAreaHomeFour />
            <BlogAreaHomeFour />
          </main>
          <FooterFour />
        </div>
      </div>

    </>
  );
};

export default HomeFourOnePage;