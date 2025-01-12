
'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import blog_data from '@/data/blog_data';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';


const blog_content = {
  subtitle: `Recent Blogs`,
  title: <>Unleash Your Creativity with <br /> Interior Inspiration</>,
}
const { subtitle, title } = blog_content
const blogs = blog_data.filter(item => item.path === 'home_1')



const BlogAreaHomeOne = () => {
  return (
    <>
      <div id="blog-one-page" className="tp-blog-area grey-bg p-relative fix pt-140 pb-150">
        <div className="tp-blog-big-text d-none d-xl-block">
          <h6>Recent</h6>
        </div>
        <div className="tp-blog-big-text-2 d-none d-xl-block">
          <h6>Blogs</h6>
        </div>
        <div className="container">
          <div className="tp-blog-title-wrap mb-55">
            <div className="row">
              <div className="col-xl-12">
                <div className="tp-blog-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-blog-wrapper p-relative">
                <div className="tp-blog-arrow-box d-none d-lg-block">

                  <button className="blog-prev">
                    <svg width="77" height="8" viewBox="0 0 77 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M0.646446 4.35355C0.451187 4.15828 0.451187 3.8417 0.646446 3.64644L3.82843 0.46446C4.02369 0.269198 4.34027 0.269198 4.53554 0.46446C4.7308 0.659722 4.7308 0.976304 4.53554 1.17157L1.70711 3.99999L4.53554 6.82842C4.7308 7.02368 4.7308 7.34027 4.53554 7.53553C4.34027 7.73079 4.02369 7.73079 3.82843 7.53553L0.646446 4.35355ZM77 4.5L1 4.49999L1 3.49999L77 3.5L77 4.5Z"
                        fill="currentcolor" />
                    </svg>
                  </button>
                  
                  <button className="blog-next">
                    <svg width="77" height="8" viewBox="0 0 77 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M76.3536 4.35355C76.5488 4.15828 76.5488 3.8417 76.3536 3.64644L73.1716 0.46446C72.9763 0.269198 72.6597 0.269198 72.4645 0.46446C72.2692 0.659722 72.2692 0.976304 72.4645 1.17157L75.2929 3.99999L72.4645 6.82842C72.2692 7.02368 72.2692 7.34027 72.4645 7.53553C72.6597 7.73079 72.9763 7.73079 73.1716 7.53553L76.3536 4.35355ZM4.37114e-08 4.5L76 4.49999L76 3.49999L-4.37114e-08 3.5L4.37114e-08 4.5Z"
                        fill="black" />
                    </svg>
                  </button>

                </div>
                <Swiper
                  loop={true}
                  speed={1000}
                  slidesPerView={2}
                  spaceBetween={40}
                  navigation={{
                    nextEl: '.blog-next',
                    prevEl: '.blog-prev',
                  }}
                  modules={[Navigation]}
                  breakpoints={{
                    '1600': {
                      slidesPerView: 2,
                    },
                    '1400': {
                      slidesPerView: 2,
                    },
                    '1200': {
                      slidesPerView: 2,
                    },
                    '992': {
                      slidesPerView: 2,
                    },
                    '768': {
                      slidesPerView: 1,
                    },
                    '576': {
                      slidesPerView: 1,
                    },
                    '0': {
                      slidesPerView: 1,
                    },
                  }}
                  className="swiper-container tp-blog-active">
                  {blogs.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-blog-item d-flex align-items-center">
                        <div className="tp-blog-thumb">
                          <Image src={item.img} alt="image-here" />
                        </div>
                        <div className="tp-blog-content">
                          <div className="tp-blog-meta mb-30">
                            <span>
                              <svg width="11" height="13" viewBox="0 0 11 13" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M3.5625 2H6.9375V1.0625C6.9375 0.757812 7.17188 0.5 7.5 0.5C7.80469 0.5 8.0625 0.757812 8.0625 1.0625V2H9C9.82031 2 10.5 2.67969 10.5 3.5V11C10.5 11.8438 9.82031 12.5 9 12.5H1.5C0.65625 12.5 0 11.8438 0 11V3.5C0 2.67969 0.65625 2 1.5 2H2.4375V1.0625C2.4375 0.757812 2.67188 0.5 3 0.5C3.30469 0.5 3.5625 0.757812 3.5625 1.0625V2ZM1.125 6.3125H3V5H1.125V6.3125ZM1.125 7.4375V8.9375H3V7.4375H1.125ZM4.125 7.4375V8.9375H6.375V7.4375H4.125ZM7.5 7.4375V8.9375H9.375V7.4375H7.5ZM9.375 5H7.5V6.3125H9.375V5ZM9.375 10.0625H7.5V11.375H9C9.1875 11.375 9.375 11.2109 9.375 11V10.0625ZM6.375 10.0625H4.125V11.375H6.375V10.0625ZM3 10.0625H1.125V11C1.125 11.2109 1.28906 11.375 1.5 11.375H3V10.0625ZM6.375 5H4.125V6.3125H6.375V5Z"
                                  fill="currentcolor" />
                              </svg>
                              {item.date} , {new Date().getFullYear()}
                            </span>
                            <span>
                              <svg width="17" height="13" viewBox="0 0 17 13" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M5.875 0.5C8.54688 0.5 10.75 2.35156 10.75 4.625C10.75 6.92188 8.54688 8.75 5.875 8.75C5.42969 8.75 5.00781 8.70312 4.58594 8.60938C3.88281 9.05469 2.85156 9.5 1.5625 9.5C1.32812 9.5 1.11719 9.38281 1.04688 9.14844C0.953125 8.9375 0.976562 8.70312 1.14062 8.51562C1.16406 8.51562 1.67969 7.95312 2.05469 7.20312C1.39844 6.5 1 5.60938 1 4.625C1 2.35156 3.17969 0.5 5.875 0.5ZM4.84375 7.50781C5.19531 7.60156 5.52344 7.625 5.875 7.625C7.9375 7.625 9.625 6.28906 9.625 4.625C9.625 2.98438 7.9375 1.625 5.875 1.625C3.78906 1.625 2.125 2.98438 2.125 4.625C2.125 5.46875 2.52344 6.07812 2.875 6.42969L3.4375 7.01562L3.0625 7.74219C2.96875 7.88281 2.875 8.04688 2.78125 8.21094C3.20312 8.09375 3.60156 7.90625 4 7.64844L4.39844 7.41406L4.84375 7.50781ZM11.3359 3.52344C13.9375 3.61719 16 5.42188 16 7.625C16 8.60938 15.5781 9.5 14.9219 10.2031C15.2969 10.9531 15.8125 11.5156 15.8359 11.5156C16 11.7031 16.0234 11.9375 15.9297 12.1484C15.8594 12.3828 15.6484 12.5 15.4141 12.5C14.125 12.5 13.0938 12.0547 12.3906 11.6094C11.9688 11.7031 11.5469 11.75 11.125 11.75C9.20312 11.75 7.53906 10.8125 6.74219 9.45312C7.14062 9.40625 7.53906 9.3125 7.89062 9.17188C8.54688 10.0625 9.74219 10.625 11.125 10.625C11.4531 10.625 11.7812 10.6016 12.1328 10.5078L12.5781 10.4141L12.9766 10.6484C13.375 10.9062 13.7734 11.0938 14.1953 11.2109C14.1016 11.0469 14.0078 10.8828 13.9141 10.7422L13.5391 10.0156L14.1016 9.42969C14.4531 9.07812 14.875 8.46875 14.875 7.625C14.875 6.07812 13.375 4.8125 11.4766 4.64844L11.5 4.625C11.5 4.25 11.4297 3.875 11.3359 3.52344Z"
                                  fill="currentcolor" />
                              </svg>
                              {item.comments > 1 ? 'Comments' : 'Comment'} ({item.comments})
                            </span>
                          </div>
                          <h4 className="tp-blog-title mb-50"><a href="blog-details.html">
                            {item.title}
                          </a></h4>
                          <Link className="tp-btn-border-lg" href="/blog-details">
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

export default BlogAreaHomeOne;