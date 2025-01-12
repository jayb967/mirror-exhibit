
import React from 'react';
import HeaderThree from '@/layouts/headers/HeaderThree';
import HeroAreaHomeFour from './HeroAreaHomeFour';
import AboutAreaHOmeFour from './AboutAreaHOmeFour';
import ServiceAreaHomeFour from './ServiceAreaHomeFour';
import BestServiceAreaHomeThree from './BestServiceAreaHomeThree';
import ProjectAreaHomeFour from './ProjectAreaHomeFour';
import FunFactAreaHomeFour from './FunFactAreaHomeFour';
import TeamAreaHomeTwo from '../home-2/TeamAreaHomeTwo';
import ProductAreaHomeFour from './ProductAreaHomeFour';
import BlogAreaHomeFour from './BlogAreaHomeFour';
import FooterFour from '@/layouts/footers/FooterFour';

const HomeFour = () => {
  return (
    <>
      <HeaderThree />
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

export default HomeFour;

