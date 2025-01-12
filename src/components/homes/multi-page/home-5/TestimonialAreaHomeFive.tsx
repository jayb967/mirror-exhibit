

'use client'
import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import testimonial_data from '@/data/testimonial_data';

const slider_data = testimonial_data.filter(item => item.path === 'home_5')

 
const TestimonialAreaHomeFive = () => {
  return (
    <>
      <div className="tp-testimonial-3-area tp-testimonial-3-wrap fix pt-140 pb-130">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-testimonial-title-box text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Testimonial</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">Discover the Art of <br /> Interior Transformation</h3>
              </div>
            </div>
          </div>
          <div className="tp-testimonial-wrapper p-relative">
            <div className="tp-testimonial-3-arrow-box d-none d-xxl-block">
              <button className="testimonial-prev">
                <svg width="91" height="24" viewBox="0 0 91 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.939339 13.0607C0.353554 12.4749 0.353554 11.5251 0.939339 10.9393L10.4853 1.39339C11.0711 0.807604 12.0208 0.807605 12.6066 1.39339C13.1924 1.97918 13.1924 2.92893 12.6066 3.51471L4.12132 12L12.6066 20.4853C13.1924 21.0711 13.1924 22.0208 12.6066 22.6066C12.0208 23.1924 11.0711 23.1924 10.4853 22.6066L0.939339 13.0607ZM91 13.5L2 13.5L2 10.5L91 10.5L91 13.5Z" fill="currentcolor" />
                </svg>
              </button>
              <button className="testimonial-next">
                <svg width="91" height="24" viewBox="0 0 91 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M90.0607 13.0607C90.6464 12.4749 90.6464 11.5251 90.0607 10.9393L80.5147 1.39339C79.9289 0.807604 78.9792 0.807605 78.3934 1.39339C77.8076 1.97918 77.8076 2.92893 78.3934 3.51471L86.8787 12L78.3934 20.4853C77.8076 21.0711 77.8076 22.0208 78.3934 22.6066C78.9792 23.1924 79.9289 23.1924 80.5147 22.6066L90.0607 13.0607ZM1.31134e-07 13.5L89 13.5L89 10.5L-1.31134e-07 10.5L1.31134e-07 13.5Z" fill="currentcolor" />
                </svg>
              </button>
            </div>
            <Swiper
              speed={1000}
              loop={true}
              slidesPerView={2}
              spaceBetween={40}
              autoplay={true}
              modules={[Autoplay, Navigation]}
              navigation={{
                nextEl: '.testimonial-next',
                prevEl: '.testimonial-prev',
              }}
              breakpoints={{
                '1600': {
                  slidesPerView: 2,
                },
                '1400': {
                  slidesPerView: 2,
                },
                '1200': {
                  slidesPerView: 2,
                },
                '992': {
                  slidesPerView: 2,
                },
                '768': {
                  slidesPerView: 1,
                },
                '576': {
                  slidesPerView: 1,
                },
                '0': {
                  slidesPerView: 1,
                }
              }}
              className="swiper-container tp-testimonial-3-active">

              {slider_data.map((item, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                  <div className="tp-testimonial-3-item">
                    <div className="tp-testimonial-3-author-thumb-box p-relative d-flex align-items-center mb-30">
                      <div className="tp-testimonial-3-author-thumb">
                        <Image src={item.img} alt="image-here" />
                      </div>
                      <div className="tp-testimonial-3-author-info">
                        <h4 className="tp-testimonial-3-title">{item.name}</h4>
                        <span>{item.designation}</span>
                      </div>
                    </div>
                    <div className="tp-testimonial-3-content p-relative">
                      <div className="tp-testimonial-3-text">
                        <p>{item.description}</p>
                      </div>
                      <div className="tp-testimonial-3-quot">
                        <span>
                          <svg width="25" height="19" viewBox="0 0 25 19" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M0 0.125V9.5H6.25C6.25 12.9453 3.44844 15.75 0 15.75V18.875C5.16953 18.875 9.375 14.6695 9.375 9.5V0.125H0ZM15.625 0.125V9.5H21.875C21.875 12.9453 19.0734 15.75 15.625 15.75V18.875C20.7945 18.875 25 14.6695 25 9.5V0.125H15.625Z"
                              fill="currentcolor" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialAreaHomeFive;