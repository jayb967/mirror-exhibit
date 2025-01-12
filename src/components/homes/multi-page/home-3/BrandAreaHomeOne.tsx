
'use client'

import React from 'react';

import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image, { StaticImageData } from 'next/image';

import brand_img_1 from "@/assets/img/brand/brand-1-1.png";
import brand_img_2 from "@/assets/img/brand/brand-1-2.png";
import brand_img_3 from "@/assets/img/brand/brand-1-3.png";
import brand_img_4 from "@/assets/img/brand/brand-1-4.png";
import brand_img_5 from "@/assets/img/brand/brand-1-5.png";
import brand_img_6 from "@/assets/img/brand/brand-1-6.png";

import brand_img_2_1 from "@/assets/img/brand/brand-2-1.png";
import brand_img_2_2 from "@/assets/img/brand/brand-2-2.png";
import brand_img_2_3 from "@/assets/img/brand/brand-2-3.png";
import brand_img_2_4 from "@/assets/img/brand/brand-2-4.png";
import brand_img_2_5 from "@/assets/img/brand/brand-2-5.png";
import brand_img_2_6 from "@/assets/img/brand/brand-2-6.png";


type DataType = StaticImageData[]

const brand_data: DataType = [
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

const brand_data_2: DataType = [
  brand_img_2_1,
  brand_img_2_2,
  brand_img_2_3,
  brand_img_2_4,
  brand_img_2_5,
  brand_img_2_6,
  brand_img_2_1,
  brand_img_2_2,
  brand_img_2_3,
  brand_img_2_4,
  brand_img_2_5,
  brand_img_2_6,
]


type style_type = {
  bg_style?: boolean
}

const BrandAreaHomeOne = ({ bg_style }: style_type) => {


  const brands = bg_style ? brand_data_2 : brand_data

  return (
    <>
      <div className={`tp-brand-area ${bg_style ? 'black-bg' : ''} pt-100 fix pb-100`}>
        <div className="container custom-container-2">
          <div className="row">
            <div className="col-12">
              <div className="tp-brand-wrapper">
                <Swiper
                  speed={1000}
                  loop={true}
                  slidesPerView={6}
                  autoplay={true}
                  modules={[Autoplay]}
                  spaceBetween={30}
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
                    },
                  }}
                  className="swiper-container tp-brand-active">
                  {brands.map((item, i) => (
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

export default BrandAreaHomeOne;