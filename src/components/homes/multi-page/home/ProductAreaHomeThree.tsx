
'use client'
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from 'swiper/modules';
import product_data from '@/data/product_data';
import { Swiper, SwiperSlide } from 'swiper/react';

const products = product_data.filter(item => item.path === 'home_3')


const ProductAreaHomeThree = () => {
  return (
    <>
      <div id="product-one-page" className="tp-product-2-area tp-product-2-style-2 fix pt-20 pb-150">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="tp-product-2-title-box text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Pricing</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">Turning Ordinary into <br /> Extra Ordinary</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-product-2-wrapper p-relative">
                <div className="tp-product-2-arrow-box">
                  <button className="price-prev">
                    <svg width="102" height="24" viewBox="0 0 102 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0.939339 13.0607C0.353554 12.4749 0.353554 11.5251 0.939339 10.9393L10.4853 1.3934C11.0711 0.807611 12.0208 0.807611 12.6066 1.3934C13.1924 1.97919 13.1924 2.92893 12.6066 3.51472L4.12132 12L12.6066 20.4853C13.1924 21.0711 13.1924 22.0208 12.6066 22.6066C12.0208 23.1924 11.0711 23.1924 10.4853 22.6066L0.939339 13.0607ZM102 13.5H2V10.5H102V13.5Z"
                        fill="currentcolor" />
                    </svg>
                  </button>
                  <button className="price-next">
                    <svg width="102" height="24" viewBox="0 0 102 24" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M101.061 13.0607C101.646 12.4749 101.646 11.5251 101.061 10.9393L91.5147 1.3934C90.9289 0.807611 89.9792 0.807611 89.3934 1.3934C88.8076 1.97919 88.8076 2.92893 89.3934 3.51472L97.8787 12L89.3934 20.4853C88.8076 21.0711 88.8076 22.0208 89.3934 22.6066C89.9792 23.1924 90.9289 23.1924 91.5147 22.6066L101.061 13.0607ZM0 13.5H100V10.5H0V13.5Z"
                        fill="currentcolor" />
                    </svg>
                  </button>
                </div>
                <Swiper
                  speed={1000}
                  loop={true}
                  slidesPerView={4}
                  spaceBetween={30}
                  autoplay={false}
                  modules={[Navigation]}
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
                    }
                  }}
                  className="swiper-container tp-product-2-active">
                  {products.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-product-2-item" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <div className="tp-product-2-content d-flex justify-content-between">
                          <h4 className="tp-product-2-title">
                            <Link href="/shop-details" dangerouslySetInnerHTML={{ __html: item.title }} >

                            </Link>
                          </h4>
                          <div className="tp-product-2-rate-2">
                            <span>${item.price}</span>
                          </div>
                        </div>
                        <div className="tp-product-2-thumb-box p-relative">
                          <div className="tp-product-2-thumb fix">
                            <Image
                              src={item.img}
                              alt="image-here"
                              width={400}
                              height={400}
                              style={{
                                objectFit: 'cover',
                                objectPosition: 'center',
                                width: '100%',
                                height: '100%'
                              }}
                            />
                            <div className="tp-product-2-btn">
                              <Link className="tp-btn-black" href="/cart">
                                <span>Buy Now</span>
                              </Link>
                            </div>
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

export default ProductAreaHomeThree;