'use client'

import React from 'react';
import Link from 'next/link';
import Count from '@/components/common/Count';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';


interface sliderDataType {
  bg_img: string;
  subtitle: string;
  title: string;
  description: string;
}
interface countDataType {
  count: number;
  title: string;
}

const slider_data: sliderDataType[] = [
  {
    bg_img: `assets/img/slider/Bathroom_Mirror_guccipattern.webp`,
    subtitle: `Unique`,
    title: `Custom Mirrors`,
    description: `Contemporary, minimal, and beautifully iconic`,
  },
  {
    bg_img: `assets/img/slider/slider-5-2.jpg`,
    subtitle: `Thoughtful`,
    title: `Interior Design`,
    description: `loborti viverra laoreet matti ullamcorper posuere viverr des <br /> Aliquam eros justo posuere lobortis non, Aliquam eros justo, <br /> posuere loborti viverra laorematu our loborti viverra`,
  },
  {
    bg_img: `assets/img/slider/slider-5-3.jpg`,
    subtitle: `Thoughtful`,
    title: `Interior Design`,
    description: `loborti viverra laoreet matti ullamcorper posuere viverr des <br /> Aliquam eros justo posuere lobortis non, Aliquam eros justo, <br /> posuere loborti viverra laorematu our loborti viverra`,
  },
]

const counter_data: countDataType[] = [
  {
    count: 40,
    title: `Winning award`
  },
  {
    count: 100,
    title: `Complete project`
  },
  {
    count: 800,
    title: `Client reviewt`
  },
]

const HeroAreaHomeFive = () => {
  return (
    <>
      <div className="tp-slider-3-area">
        <div className="tp-slider-3-wrapper p-relative">
          <div className="tp-slider-dots"></div>
          <Swiper
            speed={1000}
            loop={true}
            autoplay={true}
            effect={"fade"}
            spaceBetween={0}
            modules={[Pagination, Autoplay, EffectFade]}
            pagination={{
              el: ".tp-slider-dots",
              clickable: true,
            }}
            className="swiper-container tp-slider-3-active">
            {slider_data.map((item, i) => (
              <SwiperSlide key={i} className="swiper-slide">
                <div className="tp-slider-3-height p-relative fix grey-bg">
                  <div className="tp-slider-3-bg tp-slider-3-overlay" style={{ backgroundImage: `url(${item.bg_img})` }}></div>
                  <div className="tp-slider-3-social d-none d-xxl-block">
                    <a target='_blank' href="https://facebook.com"><i className="fa-brands fa-facebook-f"></i></a>
                    <a target='_blank' href="https://twitter.com"><i className="fa-brands fa-twitter"></i></a>
                    <a target='_blank' href="https://instagram.com"><i className="fa-brands fa-instagram"></i></a>
                    <a target='_blank' href="https://linkedin.com"><i className="fa-brands fa-linkedin"></i></a>
                  </div>
                  <div className="tp-hero-2-funfact-box d-none d-md-flex justify-content-between">

                    {counter_data.map((count, index) => (
                      <div key={index} className="tp-hero-2-funfact">
                        <h5 className='d-flex'><i className="purecounter">
                          <Count number={count.count} />
                        </i>k
                        </h5>
                        <span>{count.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="container">
                    <div className="tp-slider-3-wrap p-relative">
                      <div className="row align-items-center">
                        <div className="col-xl-12">
                          <div className="tp-slider-3-title-box">
                            <h3 className="tp-slider-3-big-text">{item.subtitle}</h3>
                            <h1 className="tp-slider-3-title mb-25">{item.title}</h1>
                          </div>
                          <div className="tp-slider-3-content">
                            <p className="mb-40" dangerouslySetInnerHTML={{ __html: item.description }}>
                            </p>
                            <Link className="tp-btn-black hover-2 theme-bg" href="/about-us">
                              <span>Read More</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default HeroAreaHomeFive;
