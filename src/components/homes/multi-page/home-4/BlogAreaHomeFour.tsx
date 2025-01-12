"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import blog_data from "@/data/blog_data";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const blogs = blog_data.filter((item) => item.path === "home_4");

const BlogAreaHomeFour = () => {
  return (
    <>
      <div
        id="blog-one-page"
        className="tp-blog-area tp-blog-style-2 grey-bg pt-145 pb-130"
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-blog-2-title-box text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">
                  Recent Blogs
                </span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right"> 
                  Elevate Your Home s Aesthetics <br /> with Interior Flair
                </h3>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-blog-wrapper">
                <Swiper
                  speed={1000}
                  loop={true}
                  slidesPerView={3}
                  autoplay={false}
                  spaceBetween={30}
                  navigation={{
                    nextEl: ".blog-prev",
                    prevEl: ".blog-next",
                  }}
                  modules={[Navigation]}
                  breakpoints={{
                    "1600": {
                      slidesPerView: 3,
                    },
                    "1400": {
                      slidesPerView: 3,
                    },
                    "1200": {
                      slidesPerView: 3,
                    },
                    "992": {
                      slidesPerView: 3,
                    },
                    "768": {
                      slidesPerView: 2,
                    },
                    "576": {
                      slidesPerView: 2,
                    },
                    "0": {
                      slidesPerView: 1,
                    },
                  }}
                  className="swiper-container tp-blog-2-ative"
                >
                  {blogs.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-blog-item d-flex align-items-center">
                        <div className="tp-blog-thumb">
                          <Link href="/blog-details">
                            <Image src={item.img} alt="image-here" />
                          </Link>
                        </div>
                        <div className="tp-blog-content">
                          <div className="tp-blog-meta mb-10">
                            <span>
                              <svg
                                width="11"
                                height="13"
                                viewBox="0 0 11 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M3.5625 2H6.9375V1.0625C6.9375 0.757812 7.17188 0.5 7.5 0.5C7.80469 0.5 8.0625 0.757812 8.0625 1.0625V2H9C9.82031 2 10.5 2.67969 10.5 3.5V11C10.5 11.8438 9.82031 12.5 9 12.5H1.5C0.65625 12.5 0 11.8438 0 11V3.5C0 2.67969 0.65625 2 1.5 2H2.4375V1.0625C2.4375 0.757812 2.67188 0.5 3 0.5C3.30469 0.5 3.5625 0.757812 3.5625 1.0625V2ZM1.125 6.3125H3V5H1.125V6.3125ZM1.125 7.4375V8.9375H3V7.4375H1.125ZM4.125 7.4375V8.9375H6.375V7.4375H4.125ZM7.5 7.4375V8.9375H9.375V7.4375H7.5ZM9.375 5H7.5V6.3125H9.375V5ZM9.375 10.0625H7.5V11.375H9C9.1875 11.375 9.375 11.2109 9.375 11V10.0625ZM6.375 10.0625H4.125V11.375H6.375V10.0625ZM3 10.0625H1.125V11C1.125 11.2109 1.28906 11.375 1.5 11.375H3V10.0625ZM6.375 5H4.125V6.3125H6.375V5Z"
                                  fill="currentcolor"
                                />
                              </svg>
                              {item.date}, {new Date().getFullYear()}
                            </span>
                          </div>
                          <h4 className="tp-blog-title mb-30">
                            <Link href="/blog-details">{item.title}</Link>
                          </h4>
                          <div className="tp-blog-button">
                            <Link
                              className="tp-btn-border-lg grey-border-2"
                              href="/blog-details"
                            >
                              <span>View More</span>
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

export default BlogAreaHomeFour;
