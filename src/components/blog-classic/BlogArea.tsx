
'use client'

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';


import blog_img_1 from '@/assets/img/blog/blog-details-1.jpg';
import blog_img_2 from '@/assets/img/blog/blog-details-2.jpg';
import blog_slider_1 from '@/assets/img/blog/blog-details-3.jpg';
import blog_slider_2 from '@/assets/img/blog/blog-details-2.jpg';
import blog_slider_3 from '@/assets/img/blog/blog-details-1.jpg';
import PostboxSidebar from '../common/PostboxSidebar';


const postbox_data = [
  {
    just_img: true,
    img: blog_img_1,
    date: `March 8`,
    title: `Experience the Power of Thoughtful Interior Design`,
    description: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
    like: 5,
    comment: 3,
  },
  {
    just_slider: true,
    slider: [blog_slider_1, blog_slider_2, blog_slider_3],
    date: `March 18`,
    title: `Elevate Your Home's Aesthetics with Interior Flair`,
    description: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
    like: 1,
    comment: 13,
  },
  {
    just_video: true,
    img: blog_img_2,
    date: `March 28`,
    title: `Reimagine Living Space with Modern Interior Concepts`,
    description: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper`,
    like: 5,
    comment: 23,
  },
]



const BlogArea = ({ setIsVideoOpen }: any) => {
  return (
    <>
      <section className="postbox__area pt-150 pb-100">
        <div className="container">
          <div className="row">
            <div className="col-xxl-8 col-xl-8 col-lg-8 mb-50">
              <div className="postbox__wrapper">

                {postbox_data.map((item, i) => (
                  <article key={i} className="postbox__item format-image mb-40">
                    {item.just_img &&
                      <div className="postbox__thumb w-img mb-20">
                        <Link href="/blog-details">
                          <Image src={item.img} alt="image-here" />
                        </Link>
                      </div>
                    }

                    {item.just_slider &&
                      <div className="postbox__thumb w-img mb-20">
                        <div className="postbox__thumb-slider p-relative">
                          <Swiper
                            speed={1000}
                            loop={true}
                            slidesPerView={1}
                            autoplay={true}
                            spaceBetween={0}
                            effect={"fade"}
                            modules={[Autoplay, Navigation]}
                            navigation={{
                              nextEl: '.postbox-arrow-next',
                              prevEl: '.postbox-arrow-prev'
                            }}
                            breakpoints={{
                              '1600': {
                                slidesPerView: 1,
                              },
                              '1400': {
                                slidesPerView: 1,
                              },
                              '1200': {
                                slidesPerView: 1,
                              },
                              '992': {
                                slidesPerView: 1,
                              },
                              '768': {
                                slidesPerView: 1,
                              },
                              '576': {
                                slidesPerView: 1,
                              },
                              '0': {
                                slidesPerView: 1,
                              }
                            }}
                            className="swiper-container postbox__thumb-slider-active">
                            {item.slider.map((item, i) => (
                              <SwiperSlide key={i}>
                                <Image src={item} alt="image-here" />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                          <div className="postbox__slider-arrow-wrap d-none d-sm-block">
                            <button className="postbox-arrow-prev">
                              <i className="fa-sharp fa-regular fa-arrow-left"></i>
                            </button>
                            <button className="postbox-arrow-next">
                              <i className="fa-sharp fa-regular fa-arrow-right"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                    {item.just_video &&
                      <div className="postbox__thumb w-img mb-25">
                        <Link href="/blog-details">
                          <Image src={item.img} alt="image-here" />
                        </Link>
                        <div className="postbox__play-btn">
                          <a className="popup-video pulse-btn"
                            onClick={() => setIsVideoOpen(true)}
                            style={{ cursor: "pointer" }}
                          ><i
                            className="fa-light fa-play"></i></a>
                        </div>
                      </div>
                    }


                    <div className="postbox__content-2">
                      <div className="postbox__meta">
                        <span className="postbox__date">{item.date}, {new Date().getFullYear()} </span>
                      </div>
                      <h3 className="postbox__title tp-split-text tp-split-in-right pb-10">
                        <Link href="/blog-details">{item.title}</Link>
                      </h3>
                      <div className="postbox__text-2 pb-25 mb-30">
                        <p>{item.description}</p>
                      </div>
                      <div className="postbox__button-box flex-wrap d-md-flex justify-content-between">
                        <div className="postbox__read-more">
                          <Link href="/blog-details" className="tp-btn-border-bottom p-relative">
                            <span>read more
                              <svg width="11" height="8" viewBox="0 0 11 8" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M10.3536 4.35355C10.5488 4.15829 10.5488 3.84171 10.3536 3.64645L7.17157 0.464467C6.97631 0.269205 6.65973 0.269204 6.46447 0.464467C6.2692 0.659729 6.2692 0.976311 6.46447 1.17157L9.29289 4L6.46447 6.82843C6.2692 7.02369 6.2692 7.34027 6.46447 7.53553C6.65973 7.7308 6.97631 7.7308 7.17157 7.53553L10.3536 4.35355ZM-4.37114e-08 4.5L10 4.5L10 3.5L4.37114e-08 3.5L-4.37114e-08 4.5Z"
                                  fill="currentcolor" />
                              </svg>
                            </span>
                            <span className="bottom-line"></span>
                          </Link>
                        </div>
                        <div className="postbox__meta mb-15">
                          <span style={{cursor: "pointer"}}>
                            <svg width="18" height="16" viewBox="0 0 18 16" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M16.5556 5.55951C16.5556 6.76233 16.0937 7.91764 15.269 8.77226C13.3705 10.7401 11.5291 12.7921 9.55968 14.6887C9.10826 15.1171 8.39216 15.1014 7.96018 14.6537L2.28626 8.77226C0.571248 6.99449 0.571248 4.12451 2.28626 2.34678C4.01812 0.551572 6.83951 0.551572 8.57136 2.34678L8.77762 2.56055L8.98374 2.3469C9.81409 1.48572 10.945 1 12.1263 1C13.3077 1 14.4385 1.48568 15.269 2.34678C16.0938 3.20146 16.5556 4.35671 16.5556 5.55951Z"
                                stroke="currentcolor" strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            {item.like} {item.like > 1 ? 'Likes' : 'Like'}
                          </span>
                          <span style={{cursor: "pointer"}}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M1 14.5295V2.56506C1 1.7007 1.7007 1 2.56506 1H13.5205C14.3849 1 15.0855 1.7007 15.0855 2.56506V10.3904C15.0855 11.2547 14.3849 11.9554 13.5205 11.9554H4.88233C4.40688 11.9554 3.95723 12.1716 3.66022 12.5428L1.83615 14.8228C1.55889 15.1694 1 14.9734 1 14.5295Z"
                                stroke="currentcolor" strokeWidth="1.5" />
                            </svg>
                            {item.comment} {item.comment > 1 ? 'Comments' : 'Comment'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}


                <div className="basic-pagination">
                  <nav>
                    <ul>
                      <li className="active">
                        <Link href="/blog-classic">1</Link>
                      </li>
                      <li>
                        <Link href="/blog-classic">2</Link>
                      </li>
                      <li>
                        <Link href="/blog-classic">3</Link>
                      </li>
                      <li>
                        <Link href="/blog-classic">
                          <span className="current"><i className="fa-regular fa-arrow-right"></i></span>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>

              </div>
            </div>

            <PostboxSidebar /> 

          </div>
        </div>
      </section>
    </>
  );
};

export default BlogArea;