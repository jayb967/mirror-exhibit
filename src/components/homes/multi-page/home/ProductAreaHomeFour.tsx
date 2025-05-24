
'use client'

import { useMemo, useState, useEffect, useRef } from 'react';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import {
  useGetShowingProductsQuery,
  useGetFilteredProductsQuery,
  useGetFeaturedProductsQuery,
  useGetPopularProductsQuery,
  useGetMostViewedProductsQuery,
  useGetNewArrivalsQuery,
  useGetTrendingProductsQuery,
  useGetProductsByCategoryQuery
} from '@/redux/features/productApi';
import ProductSkeleton from '@/components/common/ProductSkeleton';
import ProductCard from '@/components/common/ProductCard';
import { useAnalytics } from '@/utils/analytics';
import '@/styles/product-modal.css';
import '@/styles/product-carousel.css';
import Head from 'next/head';

// Props interface for the flexible component
interface ProductAreaHomeFourProps {
  // Product filtering
  productType?: 'featured' | 'popular' | 'most-viewed' | 'new-arrivals' | 'trending' | 'all';
  category?: string; // Category slug or name

  // Display customization
  title?: string;
  subtitle?: string;
  description?: string;
  sectionId?: string;

  // Behavior options
  limit?: number; // Default 15
  autoplay?: boolean; // Default true
  autoplayDelay?: number; // Default 5000ms
  showViewAll?: boolean; // Show "View All" link
  viewAllLink?: string; // Custom link for "View All"

  // Styling options
  className?: string;
  containerClassName?: string;
}

// Custom CSS for consistent product card heights
const productCardStyles = {
  swiperSlide: {
    height: 'auto', // Let the slide adjust to content
    display: 'flex',
    paddingBottom: '40px', // Add padding to accommodate the overlapping button
    justifyContent: 'center', // Center the card in the slide
  },
  swiperContainerStyle: {
    paddingBottom: '60px', // Increased padding to accommodate the "Add to Cart" button
    overflow: 'visible',
    margin: '0 -10px', // Negative margin to offset container padding
  },
  productCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'visible',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    position: 'relative' as const,
    width: '100%', // Ensure the card takes full width of the slide
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    paddingBottom: '100%', // 1:1 Aspect ratio
    overflow: 'hidden',
    borderRadius: '8px 8px 0 0',
  },
  imageWrapper: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px',
    borderTop: '1px solid #f5f5f5',
  },
  title: {
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '65%',
    fontSize: '16px',
    fontWeight: 600,
  },
  price: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#000',
  },
  navigationArrows: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.3s ease',
    opacity: 0,
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  prevArrow: {
    left: '10px',
  },
  nextArrow: {
    right: '10px',
  },
  swiperContainer: {
    position: 'relative' as const,
    paddingBottom: '30px',
  },
  swiperWrapper: {
    position: 'relative' as const,
  }
};




// const products = product_data.filter(item => item.path === 'home_3')


const ProductAreaHomeFour: React.FC<ProductAreaHomeFourProps> = ({
  // Product filtering props
  productType = 'all',
  category,

  // Display customization props
  title = 'Luxury Reflected',
  subtitle = 'Collection',
  description = 'Explore our exclusive selection of bespoke mirrors, meticulously crafted to elevate your living spaces with timeless elegance and style.',
  sectionId = 'product-carousel',

  // Behavior options
  limit = 15,
  autoplay = true,
  autoplayDelay = 5000,
  showViewAll = false,
  viewAllLink,

  // Styling options
  className = '',
  containerClassName = ''
}) => {
  // Analytics hook
  const analytics = useAnalytics();

  // Call all hooks unconditionally, then select the right data
  const filteredQuery = useGetFilteredProductsQuery(
    { type: productType, category, limit },
    { skip: !(category && productType !== 'all') }
  );
  const categoryQuery = useGetProductsByCategoryQuery(
    { category: category!, limit },
    { skip: !category || productType !== 'all' }
  );
  const featuredQuery = useGetFeaturedProductsQuery(
    { limit },
    { skip: productType !== 'featured' || !!category }
  );
  const popularQuery = useGetPopularProductsQuery(
    { limit },
    { skip: productType !== 'popular' || !!category }
  );
  const mostViewedQuery = useGetMostViewedProductsQuery(
    { limit },
    { skip: productType !== 'most-viewed' || !!category }
  );
  const newArrivalsQuery = useGetNewArrivalsQuery(
    { limit },
    { skip: productType !== 'new-arrivals' || !!category }
  );
  const trendingQuery = useGetTrendingProductsQuery(
    { limit },
    { skip: productType !== 'trending' || !!category }
  );
  const defaultQuery = useGetShowingProductsQuery(
    undefined,
    { skip: productType !== 'all' || !!category }
  );

  // Select the active query result with fallback logic
  const { data, isError, isLoading } = useMemo(() => {
    let primaryQuery;

    if (category && productType !== 'all') {
      primaryQuery = filteredQuery;
    } else if (category) {
      primaryQuery = categoryQuery;
    } else {
      switch (productType) {
        case 'featured':
          primaryQuery = featuredQuery;
          break;
        case 'popular':
          primaryQuery = popularQuery;
          break;
        case 'most-viewed':
          primaryQuery = mostViewedQuery;
          break;
        case 'new-arrivals':
          primaryQuery = newArrivalsQuery;
          break;
        case 'trending':
          primaryQuery = trendingQuery;
          break;
        default:
          primaryQuery = defaultQuery;
          break;
      }
    }

    // Check if primary query has no products and implement fallback
    if (primaryQuery.data && Array.isArray(primaryQuery.data.products) && primaryQuery.data.products.length === 0) {
      console.log(`🔄 No products found for ${productType}, falling back to default products`);
      return defaultQuery;
    }

    return primaryQuery;
  }, [
    productType, category, filteredQuery, categoryQuery, featuredQuery,
    popularQuery, mostViewedQuery, newArrivalsQuery, trendingQuery, defaultQuery
  ]);
  const [swiperRef, setSwiperRef] = useState<any>(null);

  // Check if we have an error or no products to determine if we should show error state
  const hasError = isError || (data && (!data.success || !data.products || data.products.length === 0));

  // Memoize the products array to prevent unnecessary recalculations
  const products = useMemo(() => {
    if (data?.success && data.products && data.products.length > 0) {
      // Add priority flag to the first 4 products for optimized loading
      return data.products.map((product: any, index: number) => ({
        ...product,
        priority: index < 4 // First 4 products get priority loading
      }));
    }

    // Return empty array if there's an error or no products
    return [];
  }, [data, isError]);

  // Navigation arrow handlers with analytics
  const handlePrev = () => {
    swiperRef?.slidePrev();
    analytics.trackCarouselInteraction('prev', sectionId, {
      source: `${sectionId}_carousel`
    });
  };

  const handleNext = () => {
    swiperRef?.slideNext();
    analytics.trackCarouselInteraction('next', sectionId, {
      source: `${sectionId}_carousel`
    });
  };

  // Carousel control functions with analytics
  const pauseCarousel = () => {
    console.log('🎠 Pausing carousel...', swiperRef);
    if (swiperRef && swiperRef.autoplay) {
      swiperRef.autoplay.stop();
      analytics.trackCarouselInteraction('pause', sectionId, {
        source: `${sectionId}_carousel`
      });
      console.log('🎠 Carousel paused successfully');
    } else {
      console.log('🎠 No swiper ref or autoplay available');
    }
  };

  const resumeCarousel = () => {
    console.log('🎠 Resuming carousel...', swiperRef);
    if (swiperRef && swiperRef.autoplay) {
      swiperRef.autoplay.start();
      analytics.trackCarouselInteraction('resume', sectionId, {
        source: `${sectionId}_carousel`
      });
      console.log('🎠 Carousel resumed successfully');
    } else {
      console.log('🎠 No swiper ref or autoplay available');
    }
  };

  // Create an array of skeleton loaders for loading state or error state
  const skeletonItems = Array(8).fill(0).map((_, i) => (
    <SwiperSlide
      key={`skeleton-${i}`}
      className="swiper-slide"
      style={{
        ...productCardStyles.swiperSlide,
        width: 'auto',
        padding: '10px',
      }}
    >
      <div style={{ width: '100%' }}>
        <ProductSkeleton />
      </div>
    </SwiperSlide>
  ));

  // Create error message slide
  const errorMessageSlide = (
    <SwiperSlide
      key="error-message"
      className="swiper-slide"
      style={{
        ...productCardStyles.swiperSlide,
        width: '100%',
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}
    >
      <div className="text-center py-5" style={{ width: '100%' }}>
        <div style={{
          fontSize: '48px',
          color: '#ddd',
          marginBottom: '20px'
        }}>
          📦
        </div>
        <h3 style={{
          color: '#666',
          marginBottom: '10px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Couldn't retrieve products
        </h3>
        <p style={{
          color: '#999',
          fontSize: '16px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          We're having trouble loading our product catalog right now. Please check back later or contact us if the issue persists.
        </p>
      </div>
    </SwiperSlide>
  );

  // Reference to the carousel wrapper
  const carouselRef = useRef<HTMLDivElement>(null);

  // Add hover effect for navigation arrows
  useEffect(() => {
    const handleMouseEnter = () => {
      if (carouselRef.current) {
        carouselRef.current.classList.add('hover');
      }
    };

    const handleMouseLeave = () => {
      if (carouselRef.current) {
        carouselRef.current.classList.remove('hover');
      }
    };

    const carouselElement = carouselRef.current;

    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', handleMouseEnter);
      carouselElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('mouseenter', handleMouseEnter);
        carouselElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);



  return (
    <>
      {/* Add preconnect hints for faster image loading */}
      <Head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preload" as="image" href="/assets/placeholder-product.jpg" />
      </Head>

      <div id={sectionId} className={`tp-product-2-area tp-product-2-style-3 fix pt-20 pb-150 ${className}`}>
        <div className={`container ${containerClassName}`}>
          <div className="tp-product-2-wrap mb-60">
            <div className="row align-items-end">
              <div className="col-xl-8 col-lg-8 col-md-7">
                <div className="tp-product-2-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">{title.split(' ').map((word, index) => (
                    <React.Fragment key={index}>
                      {word}
                      {index === 0 && title.split(' ').length > 1 ? <br /> : ' '}
                    </React.Fragment>
                  ))}</h3>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-5">
                <div className="tp-product-2-top-text">
                  <p>{description}</p>
                  {showViewAll && viewAllLink && (
                    <div className="mt-3">
                      <a
                        href={viewAllLink}
                        className="tp-btn tp-btn-border tp-btn-border-sm"
                        onClick={() => analytics.trackCarouselInteraction('autoplay_stop', sectionId, {
                          source: `${sectionId}_view_all`
                        })}
                      >
                        View All
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-product-2-wrapper">

                <div ref={carouselRef} style={{ position: 'relative' }} className="product-carousel-wrapper">
                  <Swiper
                    speed={1000}
                    loop={true}
                    slidesPerView={4}
                    spaceBetween={40}
                    autoplay={autoplay ? {
                      delay: autoplayDelay,
                      disableOnInteraction: false,
                    } : false}
                    mousewheel={{
                      forceToAxis: true,
                      sensitivity: 1,
                      releaseOnEdges: true,
                    }}
                    keyboard={{
                      enabled: true,
                      onlyInViewport: true,
                    }}
                    modules={[Autoplay, Pagination, Navigation, Mousewheel, Keyboard]}
                    navigation={{
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                    }}
                    onSwiper={setSwiperRef}
                    breakpoints={{
                      '1600': {
                        slidesPerView: 4,
                        spaceBetween: 40,
                      },
                      '1400': {
                        slidesPerView: 4,
                        spaceBetween: 40,
                      },
                      '1200': {
                        slidesPerView: 3,
                        spaceBetween: 30,
                      },
                      '992': {
                        slidesPerView: 3,
                        spaceBetween: 30,
                      },
                      '768': {
                        slidesPerView: 2,
                        spaceBetween: 20,
                      },
                      '576': {
                        slidesPerView: 2,
                        spaceBetween: 20,
                      },
                      '0': {
                        slidesPerView: 1,
                        spaceBetween: 10,
                      },
                    }}
                    className="swiper-container tp-product-2-active"
                    style={{
                      ...productCardStyles.swiperContainerStyle,
                      paddingBottom: '50px',
                      overflow: 'visible',
                    }}
                  >
                  {isLoading ? (
                    skeletonItems
                  ) : hasError ? (
                    // Show error message when there's an error or no products
                    errorMessageSlide
                  ) : products.length > 0 ? (
                    products.map((item: any, i: number) => (
                      <SwiperSlide
                        key={item.id || i}
                        className="swiper-slide"
                        style={{
                          ...productCardStyles.swiperSlide,
                          width: 'auto', // Let Swiper control the width
                          padding: '10px', // Add padding around each slide
                        }}
                      >
                        <div style={{ width: '100%' }}>
                          <ProductCard
                            product={item}
                            pauseCarousel={pauseCarousel}
                            resumeCarousel={resumeCarousel}
                          />
                        </div>
                      </SwiperSlide>
                    ))
                  ) : (
                    errorMessageSlide
                  )}
                  </Swiper>

                  {/* Custom navigation arrows */}
                  <div
                    className="swiper-button-prev swiper-nav-button"
                    onClick={handlePrev}
                    style={{...productCardStyles.navigationArrows, ...productCardStyles.prevArrow}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </div>
                  <div
                    className="swiper-button-next swiper-nav-button"
                    onClick={handleNext}
                    style={{...productCardStyles.navigationArrows, ...productCardStyles.nextArrow}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default ProductAreaHomeFour;