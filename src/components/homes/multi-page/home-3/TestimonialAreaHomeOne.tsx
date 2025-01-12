'use client'

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import testimonial_data from '@/data/testimonial_data';

interface DataType {
  subtitle: string;
  title: string;
  description: string;
}

const testimonial_content: DataType = {
  subtitle: `Testimonial`,
  title: `What Our Customers Say`,
  description: `Our mirrors have transformed countless spaces. Hear from our customers who value the unmatched quality and personal touch that each mirror delivers.`,
}

const { subtitle, title, description } = testimonial_content

const swiper_data = testimonial_data.filter(item => item.path === 'home_1')
 

const TestimonialAreaHomeOne = () => {
  return (
    <>
      <div className="tp-testimonial-area pt-150 pb-130">
        <div className="container">
          <div className="tp-testimonial-title-wrap mb-85">
            <div className="row align-items-end">
              <div className="col-xl-6 col-lg-6">
                <div className="tp-testimonial-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6">
                <div className="tp-testimonial-top-text">
                  <p className="mb-0">{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="tp-testimonial-wrapper">
            <Swiper
              loop={true}
              speed={1000}
              slidesPerView={2}
              spaceBetween={30}
              autoplay={true}
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
              className="swiper-container tp-testimonial-active">
              {swiper_data.map((item, i) => (
                <SwiperSlide key={i} className="swiper-slide">
                  <div className="tp-testimonial-item d-flex align-items-center">
                    <div className="tp-testimonial-author-thumb-box p-relative">
                      <div className="tp-testimonial-author-thumb">
                        <Image src={item.img} alt="image-here" />
                      </div>
                      <div className="tp-testimonial-quot">
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
                    <div className="tp-testimonial-author-box">
                      <div className="tp-testimonial-author-info">
                        <h4 className="tp-testimonial-title">{item.name}</h4>
                        <span>{item.designation}</span>
                      </div>
                      <div className="tp-testimonial-text">
                        <p>{item.description}</p>
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

export default TestimonialAreaHomeOne;