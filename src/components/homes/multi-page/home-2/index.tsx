

import React from 'react';
import HeaderTwo from '@/layouts/headers/HeaderTwo';
import HeroAreaHomeTwo from './HeroAreaHomeTwo';
import ServiceAreaHomeTwo from './ServiceAreaHomeTwo';
import AboutAreaHomeTwo from './AboutAreaHomeTwo';
import ProjectAreaHomeTwo from './ProjectAreaHomeTwo';
import BrandAreaHomeOne from '../home-3/BrandAreaHomeOne';
import TestimonialAreaHomeTwo from './TestimonialAreaHomeTwo';
import TeamAreaHomeTwo from './TeamAreaHomeTwo';
import ProductAreaHomeOne from './ProductAreaHomeOne';
import FunFactAreaHomeOne from './FunFactAreaHomeOne';
import FooterTwo from '@/layouts/footers/FooterTwo';

const HomeTwo = () => {
  return (
    <>
      <HeaderTwo  />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroAreaHomeTwo />
            <ServiceAreaHomeTwo />
            <AboutAreaHomeTwo />
            <ProjectAreaHomeTwo />
            <BrandAreaHomeOne bg_style={true} />
            <TestimonialAreaHomeTwo />
            <TeamAreaHomeTwo style_team={false} style_2={false} />
            <ProductAreaHomeOne />
            <FunFactAreaHomeOne />
          </main>
          <FooterTwo />
        </div>
      </div>
    </>
  );
};

export default HomeTwo;