
'use client'

import product_data from '@/data/product_data';
import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Mousewheel, Keyboard } from 'swiper/modules';
import { useGetShowingProductsQuery } from '@/redux/features/productApi';
import ProductSkeleton from '@/components/common/ProductSkeleton';
import ProductCard from '@/components/common/ProductCard';
import '@/styles/product-modal.css';
import '@/styles/product-carousel.css';
import Head from 'next/head';

// Custom CSS for consistent product card heights
const productCardStyles = {
  swiperSlide: {
    height: 'auto', // Let the slide adjust to content
    display: 'flex',
    paddingBottom: '40px', // Add padding to accommodate the overlapping button
    justifyContent: 'center', // Center the card in the slide
  },
  swiperContainer: {
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


const ProductAreaHomeFour = () => {
  const { data, isError, isLoading } = useGetShowingProductsQuery();
  const [swiperRef, setSwiperRef] = useState<any>(null);

  // Fallback products in case the API is down
  const fallbackProducts = [
    {
      id: 1,
      title: "Elegant Arched Wall Mirror",
      price: 199.99,
      image: "/assets/img/product/product-1.jpg",
      brand: "Mirror Exhibit",
      category: "Wall Mirrors",
      description: "A stunning arched wall mirror with a sleek gold frame that adds sophistication to any room. Perfect for entryways, living rooms, or as a statement piece in your bedroom."
    },
    {
      id: 2,
      title: "Sunburst Decorative Mirror",
      price: 149.99,
      image: "/assets/img/product/product-2.jpg",
      brand: "Mirror Exhibit",
      category: "Round Mirrors",
      description: "This eye-catching sunburst mirror creates a dramatic focal point with its radiant design. The intricate metalwork frame catches light beautifully, adding dimension and style to your walls."
    },
    {
      id: 3,
      title: "Modern Geometric Mirror",
      price: 249.99,
      image: "/assets/img/product/product-3.jpg",
      brand: "Mirror Exhibit",
      category: "Framed Mirrors",
      description: "Contemporary and bold, this geometric framed mirror features clean lines and a minimalist design. The matte black frame creates striking contrast against any wall color."
    },
    {
      id: 4,
      title: "Antique Inspired Floor Mirror",
      price: 329.99,
      image: "/assets/img/product/product-4.jpg",
      brand: "Mirror Exhibit",
      category: "Floor Mirrors",
      description: "This full-length floor mirror combines vintage charm with practical functionality. The ornate frame features hand-carved details and a distressed finish for timeless elegance."
    }
  ];

  // Memoize the products array to prevent unnecessary recalculations
  const products = useMemo(() => {
    let productList = [];

    if (data?.success && data.products && data.products.length > 0) {
      productList = data.products;
    } else {
      // Return fallback products if there's an error, no data, or empty products array
      productList = fallbackProducts;
    }

    // Add priority flag to the first 4 products for optimized loading
    return productList.map((product, index) => ({
      ...product,
      priority: index < 4 // First 4 products get priority loading
    }));
  }, [data, isError, fallbackProducts]);

  // Navigation arrow handlers
  const handlePrev = () => {
    swiperRef?.slidePrev();
  };

  const handleNext = () => {
    swiperRef?.slideNext();
  };

  // Carousel control functions
  const pauseCarousel = () => {
    if (swiperRef && swiperRef.autoplay) {
      swiperRef.autoplay.stop();
    }
  };

  const resumeCarousel = () => {
    if (swiperRef && swiperRef.autoplay) {
      swiperRef.autoplay.start();
    }
  };

  // Create an array of skeleton loaders for loading state
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

      <div id="product-one-page" className="tp-product-2-area tp-product-2-style-3 fix pt-20 pb-150">
        <div className="container">
          <div className="tp-product-2-wrap mb-60">
            <div className="row align-items-end">
              <div className="col-xl-8 col-lg-8 col-md-7">
                <div className="tp-product-2-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">Collection</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">Luxury  <br /> Reflected</h3>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-5">
                <div className="tp-product-2-top-text">
                  <p>Explore our exclusive selection of bespoke mirrors, meticulously crafted to elevate your living spaces with timeless elegance and style.</p>
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
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
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
                      ...productCardStyles.swiperContainer,
                      paddingBottom: '50px',
                      overflow: 'visible',
                    }}
                  >
                  {isLoading ? skeletonItems : products.length > 0 ? products.map((item, i) => (
                    <SwiperSlide
                      key={i}
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
                  )) : (
                    <SwiperSlide
                      className="swiper-slide"
                      style={{
                        ...productCardStyles.swiperSlide,
                        width: 'auto',
                        padding: '10px',
                      }}
                    >
                      <div className="col-12 text-center py-5">
                        <h3>No products available at the moment. Please check back later.</h3>
                      </div>
                    </SwiperSlide>
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