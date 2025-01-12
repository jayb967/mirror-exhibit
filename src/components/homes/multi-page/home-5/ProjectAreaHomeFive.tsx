
'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Swiper, SwiperSlide } from "swiper/react";
import project_data from '@/data/project_data';
import { Pagination } from "swiper/modules";

const projects = project_data.filter(item => item.path === 'home_5')

 

const ProjectAreaHomeFive = () => {
  return (
    <>
      <div id="project-one-page" className="tp-project-5-area fix pt-150">
        <div className="container-fluid p-0">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-project-5-title-box p-relative text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Latests Project</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">Where Elegance Meets <br /> Functionality</h3>
                <div className="tp-project-5-big-text d-none d-xl-block">
                  <h6>project</h6>
                </div>
              </div>
            </div>
            <div className="col-xl-12">
              <div className="tp-project-5-wrapper">
                <Swiper
                  speed={1000}
                  loop={true}
                  slidesPerView={5}
                  autoplay={false}
                  spaceBetween={30}
                  centeredSlides={true}
                  pagination={{
                    el: ".tp-project-dots",
                    clickable: true,
                  }}
                  modules={[Pagination]}
                  breakpoints={{
                    '1600': {
                      slidesPerView: 5,
                    },
                    '1400': {
                      slidesPerView: 4,
                    },
                    '1200': {
                      slidesPerView: 4,
                      spaceBetween: 15,
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
                  className="swiper-container tp-project-5-active">
                  {projects.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-project-5-item p-relative">
                        <div className="tp-project-5-thumb">
                          <Image src={item.img} alt="image-here" />
                        </div>
                        <div className="tp-project-5-content black-bg">
                          <h6 className="tp-project-5-title">
                            <Link href="/project-details">{item.title}</Link></h6>
                          <p>{item.description}</p>
                          <Link className="tp-btn-border-lg white-border" href="/project-details">
                            <span>Read More</span>
                          </Link>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}

                </Swiper>
                <div className="tp-project-dots text-center mt-110"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectAreaHomeFive;