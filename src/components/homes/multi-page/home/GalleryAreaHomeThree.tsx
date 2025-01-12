

'use client'

import React from 'react';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import gallery_img_1 from '@/assets/img/gallery/gal-1-1.jpg';
import gallery_img_2 from '@/assets/img/gallery/gal-1-2.jpg';
import gallery_img_3 from '@/assets/img/gallery/gal-1-3.jpg';


interface DataType {
  img: StaticImageData;
  title: string;
  description: string;
}
const gallery_data: DataType[] = [
  {
    img: gallery_img_1,
    title: `California Gallery`,
    description: `orem npsum dolor sit conse cteturs adipisciorem npsum dolor sit conse cteturs adipiscin`,
  },
  {
    img: gallery_img_2,
    title: `St jones Gallery`,
    description: `orem npsum dolor sit conse cteturs adipisciorem npsum dolor sit conse cteturs adipiscin`,
  },
  {
    img: gallery_img_3,
    title: `Las vegas Gallery`,
    description: `orem npsum dolor sit conse cteturs adipisciorem npsum dolor sit conse cteturs adipiscin`,
  },
  // repeat for slider
  {
    img: gallery_img_1,
    title: `California Gallery`,
    description: `orem npsum dolor sit conse cteturs adipisciorem npsum dolor sit conse cteturs adipiscin`,
  },
  {
    img: gallery_img_2,
    title: `St jones Gallery`,
    description: `orem npsum dolor sit conse cteturs adipisciorem npsum dolor sit conse cteturs adipiscin`,
  },
  {
    img: gallery_img_3,
    title: `Las vegas Gallery`,
    description: `orem npsum dolor sit conse cteturs adipisciorem npsum dolor sit conse cteturs adipiscin`,
  },

]
 
const GalleryAreaHomeThree = () => {
  return (
    <> 
      <div id="gallery-one-page" className="tp-gallery-area pt-150 pb-200">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-gallery-title-box text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Showcase of Elegance</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">See our mirrors in beautifully <br />styled homes.</h3>
              </div>
            </div>
            <div className="col-xl-12">
              <div className="tp-gallery-wrapper">
                <Swiper
                  speed={1000}
                  loop={true}
                  slidesPerView={3}
                  autoplay={true}
                  spaceBetween={30}
                  centeredSlides={true}
                  modules={[Autoplay]}
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
                      slidesPerView: 1,
                    },
                    '0': {
                      slidesPerView: 1,
                    },
                  }}
                  className="swiper-container tp-gallery-active">
                  {gallery_data.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-gallery-item p-relative">
                        <div className="tp-gallery-thumb">
                          <Image src={item.img} alt="image-here" />
                        </div>
                        <div className="tp-gallery-content black-bg">
                          <h6 className="tp-gallery-title">
                            <Link href="/project-details">{item.title}</Link>
                          </h6>
                          <p className="d-none d-md-block">{item.description}</p>
                          <Link className="tp-btn-border-lg white-border" href="/project-details">
                            <span>Read More</span>
                          </Link>
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

export default GalleryAreaHomeThree;