
'use client'

import project_data from '@/data/project_data';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';


const products = project_data.filter(item => item.path === 'shop-details')

const OurProductArea = () => {
  return (
    <>
      <div className="tp-product-2-area tp-product-2-style-3 fix pt-20 pb-150">
        <div className="container">
          <div className="tp-product-2-wrap mb-60">
            <div className="row align-items-end">
              <div className="col-xl-8 col-lg-8 col-md-7">
                <div className="tp-product-2-title-box">
                  <span className="tp-section-subtitle">Our Products</span>
                  <h3 className="tp-section-title">Living Experience with <br /> Luxurious Interiors</h3>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-5">
                <div className="tp-product-2-top-text">
                  <p>loborti viverra laoreet matti ullamcorper posuere viverra Aliquam eros justo posuere</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-product-2-wrapper">
                <Swiper
                  speed={1000}
                  loop={true}
                  slidesPerView={4}
                  autoplay={true}
                  spaceBetween={30}
                  modules={[Autoplay]}
                  breakpoints={{
                    '1600': {
                      slidesPerView: 4,
                    },
                    '1400': {
                      slidesPerView: 4,
                    },
                    '1200': {
                      slidesPerView: 3,
                    },
                    '992': {
                      slidesPerView: 3,
                    },
                    '768': {
                      slidesPerView: 2,
                    },
                    '576': {
                      slidesPerView: 2,
                    },
                    '0': {
                      slidesPerView: 1,
                    },
                  }}
                  className="swiper-container tp-product-2-active">
                  {products.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-product-2-item">
                        <div className="tp-product-2-thumb-box p-relative">
                          <div className="tp-product-2-thumb fix p-relative">
                            <Image src={item.img} alt="image-here" />
                            <div className="tp-product-2-button-box">
                              <button className="tp-btn-black-lg">
                                <span>Buy Now</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="tp-product-2-content d-flex justify-content-between align-items-center">
                          <h4 className="tp-product-2-title mb-0">
                            <Link href="/shop-details">
                              <span dangerouslySetInnerHTML={{ __html: item.title || '' }}></span>
                            </Link>
                          </h4>
                          <div className="tp-product-2-rate-2">
                            <span>$19</span>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))} 
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div >
    </>
  );
};

export default OurProductArea;