
'use client'

import React from 'react';
import Image from 'next/image';
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import brand_img_1 from "@/assets/img/brand/brand-1-1.png";
import brand_img_2 from "@/assets/img/brand/brand-1-2.png";
import brand_img_3 from "@/assets/img/brand/brand-1-3.png";
import brand_img_4 from "@/assets/img/brand/brand-1-4.png";
import brand_img_5 from "@/assets/img/brand/brand-1-5.png";
import brand_img_6 from "@/assets/img/brand/brand-1-6.png";


const brand_data = [
  brand_img_1,
  brand_img_2,
  brand_img_3,
  brand_img_4,
  brand_img_5,
  brand_img_6,
  brand_img_1,
  brand_img_2,
  brand_img_3,
  brand_img_4,
  brand_img_5,
  brand_img_6,
]


const BrandAreaHomeFive = () => {
  return (
    <>
      <div className="tp-brand-area pt-100 fix pb-90">
        <div className="container custom-container-2">
          <div className="row">
            <div className="col-12">
              <div className="tp-brand-wrapper">
                <Swiper
                  speed={1000}
                  slidesPerView={6}
                  autoplay={true}
                  spaceBetween={30}
                  modules={[Autoplay]}
                  breakpoints={{
                    '1600': {
                      slidesPerView: 6,
                    },
                    '1400': {
                      slidesPerView: 6,
                    },
                    '1200': {
                      slidesPerView: 5,
                    },
                    '992': {
                      slidesPerView: 4,
                    },
                    '768': {
                      slidesPerView: 3,
                    },
                    '576': {
                      slidesPerView: 2,
                    },
                    '0': {
                      slidesPerView: 1,
                    }
                  }}
                  className="swiper-container tp-brand-active">
                  {brand_data.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-brand-item text-center">
                        <Image src={item} alt="image-here" />
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

export default BrandAreaHomeFive;