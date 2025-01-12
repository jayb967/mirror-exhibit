"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import team_data from "@/data/team_data";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const members = team_data.filter((item) => item.path === "home_2");

const TeamAreaHomeThree = () => {
  return (
    <>
      <div
        id="team-one-page"
        className="tp-team-area tp-team-style-2 fix pb-140"
      >
        <div className="container">
          <div className="tp-team-title-wrap mb-60">
            <div className="row align-items-end">
              <div className="col-xl-7 col-lg-6">
                <div className="tp-team-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">
                    Our Team
                  </span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">
                    Elevate Your Home s Flair <br /> Aesthetics Interior{" "}
                  </h3>
                </div>
              </div>
              <div className="col-xl-5 col-lg-6">
                <div className="tp-team-top-text">
                  <p>
                    loborti viverra laoreet matti ullamcorper posuere viverra
                    Aliquam eros justo, posuere lobortis non, Aliquam eros
                    justo, posuere loborti viverra posuere lobortis
                    laorematullamcorpeposuere{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-team-wrapper">
                <Swiper
                  speed={1500}
                  loop={true}
                  slidesPerView={3}
                  autoplay={true}
                  spaceBetween={70}
                  modules={[Autoplay]}
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
                      spaceBetween: 30,
                    },
                    "0": {
                      slidesPerView: 1,
                    },
                  }}
                  className="swiper-container tp-team-active"
                >
                  {members.map((item, i) => (
                    <SwiperSlide key={i} className="swiper-slide">
                      <div className="tp-team-item">
                        <div className="tp-team-thumb p-relative fix mb-25">
                          <Image
                            src={item.img}
                            style={{ objectFit: "cover" }}
                            alt="image-here"
                          />
                          <div className="tp-team-social-box">
                            <a href="#">
                              <i className="fa-brands fa-facebook-f"></i>
                            </a>
                            <a href="#">
                              <i className="fa-brands fa-twitter"></i>
                            </a>
                            <a href="#">
                              <i className="fa-brands fa-instagram"></i>
                            </a>
                            <a href="#">
                              <i className="fa-brands fa-pinterest-p"></i>
                            </a>
                          </div>
                        </div>
                        <div className="tp-team-author-info">
                          <span>{item.designation}</span>
                          <h5 className="tp-team-title">
                            <Link href="/team-details">{item.name}</Link>
                          </h5>
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

export default TeamAreaHomeThree;
