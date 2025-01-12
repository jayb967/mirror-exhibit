
import React from 'react';
import HeaderTwo from '@/layouts/headers/HeaderTwo';
import HeroAreaHomeTwo from '../../multi-page/home-2/HeroAreaHomeTwo';
import ServiceAreaHomeTwo from '../../multi-page/home-2/ServiceAreaHomeTwo';
import AboutAreaHomeTwo from '../../multi-page/home-2/AboutAreaHomeTwo';
import ProjectAreaHomeTwo from '../../multi-page/home-2/ProjectAreaHomeTwo';
import BrandAreaHomeOne from '../../multi-page/home-3/BrandAreaHomeOne';
import TestimonialAreaHomeTwo from '../../multi-page/home-2/TestimonialAreaHomeTwo';
import TeamAreaHomeTwo from '../../multi-page/home-2/TeamAreaHomeTwo';
import ProductAreaHomeOne from '../../multi-page/home-3/ProductAreaHomeOne';
import FunFactAreaHomeOne from '../../multi-page/home-3/FunFactAreaHomeOne';
import FooterTwo from '@/layouts/footers/FooterTwo';

const HomeTwoOnePage = () => {
  return (
    <>
      <HeaderTwo onePageHomeTwo={true} />
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
            <FunFactAreaHomeOne style_2={false} />
          </main>
          <FooterTwo />
        </div>
      </div>

    </>
  );
};

export default HomeTwoOnePage;