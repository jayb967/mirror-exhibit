import team_data from "@/data/team_data";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const team_members = team_data.filter((item) => item.path === "home_5");

interface DataType {
  subtitle: string;
  title: React.JSX.Element;
  description: string;
}

const team_content: DataType = {
  subtitle: `Our Team`,
  title: (
    <>
      Elevate Your Home s with <br /> Interior Flair
    </>
  ),
  description: `loborti viverra laoreet matti ullamcorper posuere viverra Aliquam eros justo, posuere lobortis non, Aliquam eros justo, posuere loborti viverra`,
};
const { subtitle, title, description } = team_content;
const TeamAreaHomeFive = () => {
  return (
    <>
      <div
        id="team-one-page"
        className="tp-team-area tp-team-style-3 fix pt-140"
      >
        <div className="container">
          <div className="tp-team-title-wrap p-relative mb-60">
            <div className="tp-team-big-text d-none d-xl-block">
              <h6>team</h6>
            </div>
            <div className="row align-items-end">
              <div className="col-xl-8 col-lg-7 col-md-7">
                <div className="tp-team-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">
                    {subtitle}
                  </span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">
                    {title}
                  </h3>
                </div>
              </div>
              <div className="col-xl-4 col-lg-5 col-md-5">
                <div className="tp-team-top-text">
                  <p className="mb-0">{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {team_members.map((item, i) => (
              <div key={i} className="col-xl-6 col-lg-4 col-md-6 mb-30">
                <div className="tp-team-item d-flex align-items-xl-end align-items-center">
                  <div className="tp-team-thumb p-relative fix">
                    <Image src={item.img} alt="image-here" />
                  </div>
                  <div className="tp-team-author-info">
                    <span>{item.designation}</span>
                    <h5 className="tp-team-title pb-20">
                      <Link href="/team-details">{item.name}</Link>
                    </h5>
                    <div className="tp-team-social-box">
                      <a target="_blank" href="https://facebook.com">
                        <i className="fa-brands fa-facebook-f"></i>
                      </a>
                      <a target="_blank" href="https://twitter.com">
                        <i className="fa-brands fa-twitter"></i>
                      </a>
                      <a target="_blank" href="https://instagram.com">
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a target="_blank" href="https://pinterest.com">
                        <i className="fa-brands fa-pinterest-p"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamAreaHomeFive;
