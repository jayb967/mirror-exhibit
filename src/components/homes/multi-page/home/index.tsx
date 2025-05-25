

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
import LazySection from '@/components/common/LazySection';

const HomeThree = () => {
  return (
    <>
      <HeaderFour />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            {/* Above-the-fold content - load immediately */}
            <HeroAreaHomeThree />

            <LazySection priority={true}>
              <ServiceAreaHomeThree />
            </LazySection>

            {/* Premium Collection Section - First product section, load with priority */}
            <LazySection priority={true}>
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
            </LazySection>

            {/* Lazy load below-the-fold content */}
            <LazySection>
              <AboutAreaHomeThree />
            </LazySection>

            <LazySection>
              <FunFactAreaHomeThree />
            </LazySection>

            {/* New Arrivals Section - Lazy loaded */}
            <LazySection>
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
            </LazySection>

            <LazySection>
              <FeatureAreaHomeThree />
            </LazySection>

            {/* <GalleryAreaHomeThree />  TODO: ADD THIS LATER TO THE CMS!*/}
            {/* <TeamAreaHomeThree /> */}

            <LazySection>
              <ExpartFeatureAreaHomeThree />
            </LazySection>

            {/* Popular Products Section - Lazy loaded */}
            <LazySection>
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
            </LazySection>

            <LazySection>
              <TestimonialAreaHomeTwo />
            </LazySection>

            {/* <BlogAreaHomeThree /> */}
            <LazySection>
              <NewsletterAreaHomeThree />
            </LazySection>
          </main>
          <FooterThree />
        </div>
      </div>

    </>
  );
};

export default HomeThree;

