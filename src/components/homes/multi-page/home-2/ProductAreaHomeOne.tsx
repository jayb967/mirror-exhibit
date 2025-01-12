
'use client'
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import product_data from '@/data/product_data';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

const products = product_data.filter(item => item.path === 'home_2')

const product_content = {
  subtitle: `Best Deals`,
  title: 'Pricing',
  description: <>Aesthetics with <br /> Interior Flair</>,
}
const { subtitle, title, description } = product_content

const ProductAreaHomeOne = () => {
  return (
    <>
      <div className="tp-product-2-area fix pt-140 pb-150">
        <div className="container">
          <div className="tp-product-2-title-wrap p-relative mb-60">
            <div className="tp-product-2-big-text d-none d-xl-block">
              <h6>{subtitle}</h6>
            </div>
            <div className="row align-items-end">
              <div className="col-xl-6 col-lg-6 col-md-7">
                <div className="tp-product-2-title-box">
                  <span className="tp-section-subtitle text-black tp-split-text tp-split-in-right">{title}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">{description}</h3>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-5">
                <div className="tp-product-2-button text-md-end">
                  <div className="tp-product-2-button mr-25">
                    <Link className="tp-btn-black" href="/shop">
                      <span>View More</span>
                    </Link>
                  </div>
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
                  navigation={{
                    nextEl: '.price-next',
                    prevEl: '.price-prev',
                  }}
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
                      <div className="tp-product-2-item text-center">
                        <div className="tp-product-2-content">
                          <h4 className="tp-product-2-title">
                            <Link href="/shop-details">{item.title}</Link></h4>
                        </div>
                        <div className="tp-product-2-thumb-box p-relative">
                          <div className="tp-product-2-thumb fix">
                            <Image src={item.img} alt="image-here" />
                            <div className="tp-product-2-btn">
                              <Link className="tp-btn-black" href="/cart">
                                <span>Buy Now</span>
                              </Link>
                            </div>
                          </div>
                          <div className="tp-product-2-rate">
                            <span>${item.price}</span>
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
      </div>
    </>
  );
};

export default ProductAreaHomeOne;