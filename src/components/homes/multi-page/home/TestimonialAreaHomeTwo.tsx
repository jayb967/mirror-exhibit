'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import testimonial_data from '@/data/testimonial_data';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
const testimonials = testimonial_data.filter(item => item.path === 'home_1')

const testimonial_content = {
  subtitle: `Testimonial`,
  title: <>What Our Customers Say</>,
}
const {subtitle, title} = testimonial_content


const TestimonialAreaHomeTwo = () => {
  // State to track current slide for dynamic image display
  const [currentSlide, setCurrentSlide] = useState(0);

  // Get current testimonial image or fallback
  const getCurrentImage = () => {
    if (testimonials[currentSlide]?.img) {
      return testimonials[currentSlide].img;
    }
    // Fallback to first testimonial image or default
    return testimonials[0]?.img || '/assets/img/testimonial/IMG_7200.jpg';
  };

  return (
    <>
      <div id="testimonial-one-page" className="tp-testimonial-2-area p-relative fix pt-140 pb-140 grey-bg">
        <div className="tp-testimonial-2-big-text d-none d-xl-block">
          <h6>Review</h6>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-testimonial-2-title-box mb-65">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
              </div>
            </div>
          </div>
          <div className="row align-items-center">
            <div className="col-xl-5 col-lg-5 col-md-5">
              <div className="tp-testimonial-2-thumb">
                {/* Fast-loading fallback image */}
                <Image
                  src={getCurrentImage()}
                  alt="Customer testimonial"
                  width={500}
                  height={500}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    objectFit: 'cover',
                    objectPosition: 'center',
                    aspectRatio: '1 / 1'
                  }}
                  loading="eager"
                />

                {/* WebGL wrapper - loads in background */}
                <div className="tp-hover-distort-wrapper" style={{ position: 'relative', zIndex: 2 }}>
                  <div className="canvas"></div>
                  <div className="tp-hover-distort" data-displacementimage="/assets/img/webgl/10.jpg">
                    <Image
                      className="tp-hover-distort-img front"
                      src={getCurrentImage()}
                      alt="Customer testimonial"
                      width={500}
                      height={500}
                      style={{
                        opacity: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        aspectRatio: '1 / 1'
                      }}
                    />
                    <Image
                      className="tp-hover-distort-img back"
                      src={getCurrentImage()}
                      alt="Customer testimonial"
                      width={500}
                      height={500}
                      style={{
                        display: 'none',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        aspectRatio: '1 / 1'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-7 col-lg-7 col-md-7">
              <div className="tp-testimonial-2-wrapper p-relative">
                <Swiper
                  speed={1000}
                  loop={true}
                  slidesPerView={1}
                  autoplay={true}
                  spaceBetween={30}
                  modules={[Autoplay, Navigation]}
                  navigation={{
                    nextEl: '.testimonial-next',
                    prevEl: '.testimonial-prev',
                  }}
                  onSlideChange={(swiper) => {
                    setCurrentSlide(swiper.realIndex);
                  }}
                  breakpoints={{
                    '1600': {
                      slidesPerView: 1,
                    },
                    '1400': {
                      slidesPerView: 1,
                    },
                    '1200': {
                      slidesPerView: 1,
                    },
                    '992': {
                      slidesPerView: 1,
                    },
                    '768': {
                      slidesPerView: 1,
                    },
                    '576': {
                      slidesPerView: 1,
                    },
                    '0': {
                      slidesPerView: 1,
                    },
                  }}
                  className="swiper-container tp-testimonial-2-active">
                  {testimonials.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-testimonial-2-content">
                        <div className="tp-testimonial-2-rate pb-15">
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                          <i className="fa-solid fa-star"></i>
                        </div>
                        <div className="tp-testimonial-2-author-info">
                          <h5>{item.name}</h5>
                          <span>{item.designation}</span>
                        </div>
                        <div className="tp-testimonial-2-text">
                          <p>{item.description}</p>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="tp-testimonial-2-arrow-box d-none d-xl-block">
                  <button className="testimonial-prev">
                    <svg width="56" height="24" viewBox="0 0 56 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.939335 10.9393C0.35355 11.5251 0.35355 12.4749 0.939335 13.0607L10.4853 22.6066C11.0711 23.1924 12.0208 23.1924 12.6066 22.6066C13.1924 22.0208 13.1924 21.0711 12.6066 20.4853L4.12132 12L12.6066 3.51472C13.1924 2.92893 13.1924 1.97919 12.6066 1.3934C12.0208 0.807611 11.0711 0.807611 10.4853 1.3934L0.939335 10.9393ZM56 10.5L2 10.5V13.5L56 13.5V10.5Z" fill="currentcolor" />
                    </svg>
                  </button>
                  <button className="testimonial-next">
                    <svg width="56" height="24" viewBox="0 0 56 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M55.0607 10.9393C55.6465 11.5251 55.6465 12.4749 55.0607 13.0607L45.5147 22.6066C44.9289 23.1924 43.9792 23.1924 43.3934 22.6066C42.8076 22.0208 42.8076 21.0711 43.3934 20.4853L51.8787 12L43.3934 3.51472C42.8076 2.92893 42.8076 1.97919 43.3934 1.3934C43.9792 0.807611 44.9289 0.807611 45.5147 1.3934L55.0607 10.9393ZM0 10.5L54 10.5V13.5L0 13.5L0 10.5Z" fill="currentcolor" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialAreaHomeTwo;