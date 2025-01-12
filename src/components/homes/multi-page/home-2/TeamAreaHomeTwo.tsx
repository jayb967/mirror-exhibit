"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import team_data from "@/data/team_data";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

const team_members = team_data.filter((item) => item.path === "home_2");

interface DataType {
  subtitle: string;
  title: React.JSX.Element;
}
const team_content: DataType = {
  subtitle: "Our Team",
  title: (
    <>
      Elevate Your Home  Aesthetics <br /> with Interior Flair
    </>
  ),
};
const { subtitle, title } = team_content;

type style_type = {
  style_2: boolean;
  style_team: boolean;
};

const TeamAreaHomeTwo = ({ style_2, style_team }: style_type) => {
  return (
    <>
      <div
        id="team-one-page"
        className={`tp-team-area ${style_2
            ? "tp-team-style-2 tp-team-style-4 pt-140"
            : style_team
              ? ""
              : "grey-bg"
          } fix pb-140`}
      >
        <div className="container">
          {style_team ? null : (
            <div className="row">
              <div className="col-xl-12">
                <div className="tp-team-title-box text-center mb-60">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">
                    {subtitle}
                  </span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">
                    {title}
                  </h3>
                </div>
              </div>
            </div>
          )}
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-team-wrapper">
                <Swiper
                  speed={1500}
                  loop={true}
                  slidesPerView={3}
                  autoplay={true}
                  modules={[Autoplay]}
                  spaceBetween={style_team ? 30 : 70}
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
                  {team_members.map((member, index) => (
                    <SwiperSlide key={index} className="swiper-slide">
                      <div className="tp-team-item">
                        <div
                          className={`tp-team-thumb p-relative fix ${style_2 ? "" : "mb-35"
                            }`}
                        >
                          <Image
                            src={member.img}
                            style={{ height: "auto" }}
                            alt="image-here"
                          />
                          <div
                            className={`${style_2 ? "tp-team-social-box" : "tp-team-social"
                              }`}
                          >
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
                          {style_2 ? (
                            <>
                              <span>{member.designation}</span>
                              <h5 className="tp-team-title">
                                <Link href="/team-details">{member.name}</Link>
                              </h5>
                            </>
                          ) : (
                            <>
                              <h5 className="tp-team-title">
                                <Link href="/team-details">{member.name}</Link>
                              </h5>
                              <span>{member.designation}</span>
                            </>
                          )}
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

export default TeamAreaHomeTwo;
