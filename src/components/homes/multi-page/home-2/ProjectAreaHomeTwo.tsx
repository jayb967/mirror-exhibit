

'use client'
import React from 'react';
import project_data from '@/data/project_data';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';


const projects = project_data.filter(item => item.path === 'home_2')


interface DataType {
  subtitle: string;
  title: React.JSX.Element;
}
const project_content: DataType = {
  subtitle: `Latests Project`,
  title: <>Experience Power Thoughtful <br /> Interior Design</>,
}
const { subtitle, title } = project_content

const ProjectAreaHomeTwo = () => {
  return (
    <>
      <div id="project-one-page" className="tp-project-2-area pt-135 fix pb-145">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-project-2-title-box text-center pb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-project-2-wrapper p-relative">
                <Swiper
                  speed={1000}
                  loop={true}
                  slidesPerView={3}
                  autoplay={true}
                  spaceBetween={30}
                  centeredSlides={true}
                  modules={[Autoplay, Pagination]}
                  pagination={{
                    el: ".tp-project-dots",
                    clickable: true,
                  }}
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
                  className="swiper-container tp-project-2-active">
                  {projects.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-project-2-item">
                        <div className="tp-project-2-thumb mb-30">
                          <Link href="/project-details">
                            <Image src={item.img} alt="image-here" /></Link>
                        </div>
                        <h4 className="tp-project-2-title">
                          <Link href="/project-details">{item.title}</Link>
                        </h4>
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

export default ProjectAreaHomeTwo;