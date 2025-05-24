

import React from 'react';
import HeaderFour from '@/layouts/headers/HeaderFour';
import HeroAreaHomeThree from './HeroAreaHomeFive';
import ServiceAreaHomeThree from './ServiceAreaHomeThree';
import AboutAreaHomeThree from './AboutAreaHomeThree';
import FunFactAreaHomeThree from './FunFactAreaHomeThree';
import FeatureAreaHomeThree from './FeatureAreaHomeThree';
import TestimonialAreaHomeTwo from './TestimonialAreaHomeTwo';
import ExpartFeatureAreaHomeThree from './ExpartFeatureAreaHomeThree';
import ProductAreaHomeFour from './ProductAreaHomeFour';
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

            {/* Premium Collection Section - Using default products since no featured products exist */}
            <ProductAreaHomeFour
              productType="all"
              title="Premium Collection"
              subtitle="Handpicked Selection"
              description="Our most popular mirrors chosen by design experts for their exceptional quality and timeless appeal."
              sectionId="premium-products"
              limit={15}
              showViewAll={true}
              viewAllLink="/shop"
            />

            <AboutAreaHomeThree />
            <FunFactAreaHomeThree />

            {/* New Arrivals Section */}
            <ProductAreaHomeFour
              productType="new-arrivals"
              title="Fresh Designs"
              subtitle="New Arrivals"
              description="Latest additions to our mirror collection, featuring the newest trends in contemporary design."
              sectionId="new-arrivals"
              limit={12}
              autoplayDelay={4000}
              showViewAll={true}
              viewAllLink="/shop?sort=newest"
            />

            <FeatureAreaHomeThree />
            {/* <GalleryAreaHomeThree />  TODO: ADD THIS LATER TO THE CMS!*/}
            {/* <TeamAreaHomeThree /> */}
            <ExpartFeatureAreaHomeThree />
          

            {/* Popular Products Section */}
            <ProductAreaHomeFour
              productType="popular"
              title="Customer Favorites"
              subtitle="Most Loved"
              description="The mirrors our customers can't stop talking about - discover what makes these pieces so special."
              sectionId="popular-products"
              limit={15}
              autoplayDelay={6000}
              showViewAll={true}
              viewAllLink="/shop?sort=popular"
            />
              <TestimonialAreaHomeTwo />

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

