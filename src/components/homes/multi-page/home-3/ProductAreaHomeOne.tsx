'use client'

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import product_data from '@/data/product_data';
import { Swiper, SwiperSlide } from 'swiper/react';

const products = product_data.filter(item => item.path === 'home_1')


interface DataType {
  subtitle: string;
  title: React.JSX.Element;
  description: string;
}
const product_content: DataType = {
  subtitle: `Our Products`,
  title: <>Living Experience with <br /> Luxurious Interiors</>,
  description: `loborti viverra lal oborti viverra laoreet matti ullamcorper posuere viverra Aliquam eros justo posuereoreet matti ullamcorper`,
}

const { subtitle, title, description } = product_content


const ProductAreaHomeOne = () => {
  return (
    <>
      <div id="product-one-page" className="tp-product-area fix pt-65 pb-150">
        <div className="container">
          <div className="tp-product-title-wrap mb-60">
            <div className="row align-items-end">
              <div className="col-xxl-8 col-xl-7 col-lg-6">
                <div className="tp-product-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
                </div>
              </div>
              <div className="col-xxl-4 col-xl-5 col-lg-6">
                <div className="tp-product-top-text">
                  <p className="mb-0">{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-product-wrapper">
                <Swiper
                  loop={true}
                  speed={1000}
                  slidesPerView={3}
                  autoplay={true}
                  spaceBetween={30}
                  breakpoints={{
                    '1600': {
                      slidesPerView: 3,
                    },
                    '1400': {
                      slidesPerView: 3,
                    },
                    '1200': {
                      slidesPerView: 3,
                    },
                    '992': {
                      slidesPerView: 2,
                    },
                    '768': {
                      slidesPerView: 2,
                    },
                    '576': {
                      slidesPerView: 1,
                    },
                    '0': {
                      slidesPerView: 1,
                    },
                  }}
                  className="swiper-container tp-product-active">
                  {products.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-product-item">
                        <div className="tp-product-thumb">
                          <Image src={item.img} alt="image-here" />
                        </div>
                        <div className="tp-product-content-box">
                          <div
                            className="tp-product-content mb-20 d-flex align-items-center justify-content-between">
                            <h4 className="tp-product-title">
                              <Link href="/shop-details" dangerouslySetInnerHTML={{ __html: item.title }}>
                              </Link>
                            </h4>
                            <span className="tp-product-price">${item.price}</span>
                          </div>
                          <div className="tp-product-button text-center">
                            <Link className="tp-btn-border" href="/shop-details">
                              <span>
                                view details
                              </span>
                            </Link>
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


