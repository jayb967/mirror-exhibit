
'use client'
import React from 'react';
import Link from 'next/link';
import Count from '@/components/common/Count';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image, { StaticImageData } from 'next/image';

import sldier_img_1 from "@/assets/img/slider/slider-4-1.jpg";
import sldier_img_2 from "@/assets/img/slider/slider-4-2.jpg";


interface DataType {
  title: string;
  description: string;
  btn_text: string;
  counter_data: {
    count: number;
    title: string;
  }[];
  slider_data: StaticImageData[];
}

const hero_content: DataType = {
  title: `Living with Modern Interior Conceptss`,
  description: `Dolen Son The dolor sit amet, consectetur adipiscing elit. Sed sit amet rhoncus nunc Duis egestas ac ante sed tincidunt. Maecena Dolen`,
  btn_text: `Read More`,
  counter_data: [
    {
      count: 10,
      title: `Winning award`,
    },
    {
      count: 100,
      title: `Complete project`,
    },
    {
      count: 800,
      title: `Client reviewt`,
    },
  ],
  slider_data: [
    sldier_img_1,
    sldier_img_2,
    sldier_img_1,
    sldier_img_2,
    sldier_img_1,
    sldier_img_2,
  ]
}
const { title, description, btn_text, counter_data, slider_data } = hero_content
 
const HeroAreaHomeFour = () => {
  return (
    <>
      <div className="tp-slider-2-area tp-slider-2-height tp-slider-2-bg fix grey-bg p-relative">
        <div className="container">
          <div className="tp-slider-2-wrap p-relative">
            <div className="row">
              <div className="col-xl-7 col-lg-6">
                <div className="tp-slider-2-content">
                  <h1 className="tp-slider-title tp-split-text tp-split-in-right text-black mb-25">{title}</h1>
                  <p className="mb-40">{description}</p>
                  <Link className="tp-btn-black theme-bg mb-20" href="/about-us">
                    <span>{btn_text}</span>
                  </Link>
                  <div className="tp-hero-2-funfact-box d-flex justify-content-between">
                    {counter_data.map((item, i) => (
                      <div key={i} className="tp-hero-2-funfact">
                        <h5 className="d-flex">
                          <i className="purecounter">
                            <Count number={item.count} /> 
                          </i>K
                        </h5>
                        <span>{item.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-xl-5 col-lg-6">
                <div className="tp-slider-2-wrapper p-relative">
                  <Swiper
                    speed={1000}
                    loop={true}
                    slidesPerView={2}
                    autoplay={true}
                    spaceBetween={30}
                    modules={[Autoplay]}
                    breakpoints={{
                      '1600': {
                        slidesPerView: 2,
                      },
                      '1400': {
                        slidesPerView: 2,
                      },
                      '1200': {
                        slidesPerView: 1,
                      },
                      '992': {
                        slidesPerView: 1,
                      },
                      '768': {
                        slidesPerView: 2,
                        spaceBetween: 10,
                      },
                      '576': {
                        slidesPerView: 2,
                        spaceBetween: 20,
                      },
                      '0': {
                        slidesPerView: 1,
                      },
                    }}
                    className="swiper-container tp-slider-2-active">
                    {slider_data.map((item, i) => (
                      <SwiperSlide key={i} className="swiper-slide">
                        <div className="tp-slider-2-thumb">
                          <Image src={item} alt="image-here" />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="tp-slider-icon">
                    <span>
                      <svg width="49" height="49" viewBox="0 0 49 49" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M47.5077 23.1257L40.6927 21.1782C37.6238 20.313 34.8282 18.6747 32.5735 16.42C30.3188 14.1653 28.6805 11.3697 27.8153 8.30073L25.8678 1.48573C25.7698 1.2473 25.6032 1.04336 25.3891 0.899839C25.175 0.756317 24.923 0.679688 24.6652 0.679688C24.4075 0.679688 24.1555 0.756317 23.9414 0.899839C23.7273 1.04336 23.5607 1.2473 23.4627 1.48573L21.5152 8.30073C20.65 11.3697 19.0117 14.1653 16.757 16.42C14.5023 18.6747 11.7067 20.313 8.63775 21.1782L1.82275 23.1257C1.56108 23.2 1.33077 23.3576 1.16678 23.5746C1.00279 23.7916 0.914062 24.0562 0.914062 24.3282C0.914062 24.6002 1.00279 24.8648 1.16678 25.0818C1.33077 25.2989 1.56108 25.4565 1.82275 25.5307L8.63775 27.4782C11.7067 28.3435 14.5023 29.9818 16.757 32.2365C19.0117 34.4912 20.65 37.2868 21.5152 40.3557L23.4627 47.1707C23.537 47.4324 23.6946 47.6627 23.9116 47.8267C24.1287 47.9907 24.3932 48.0794 24.6652 48.0794C24.9373 48.0794 25.2018 47.9907 25.4189 47.8267C25.6359 47.6627 25.7935 47.4324 25.8678 47.1707L27.8153 40.3557C28.6805 37.2868 30.3188 34.4912 32.5735 32.2365C34.8282 29.9818 37.6238 28.3435 40.6927 27.4782L47.5077 25.5307C47.7694 25.4565 47.9997 25.2989 48.1637 25.0818C48.3277 24.8648 48.4164 24.6002 48.4164 24.3282C48.4164 24.0562 48.3277 23.7916 48.1637 23.5746C47.9997 23.3576 47.7694 23.2 47.5077 23.1257Z"
                          fill="currentcolor" />
                      </svg>
                    </span>
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

export default HeroAreaHomeFour;