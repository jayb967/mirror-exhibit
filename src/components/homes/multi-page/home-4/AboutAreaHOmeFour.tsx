

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import about_img_1 from "@/assets/img/about/thumb-4-1.jpg";
import about_img_2 from "@/assets/img/about/thumb-4-2.jpg";


interface DataType {
  subtitle: string;
  title: string;
  description: string;
  features: {
    item: string[];
  }[];
}

const about_content: DataType = {
  subtitle: "About Us",
  title: "Create a Serene Oasis in Your Living Space",
  description: `loborti viverra laoreet matti ullamcorper posuere viverra Aliquam eros justo posuere lobortis non, Aliquam eros justo, posuere loborti viverra laorematul lamcorpeposuere viverra liquam eros justo, posuere`,
  features: [
    {
      item: [
        "Long Established",
        "Many Desktop",
        "Something by accident ",
      ]
    },
    {
      item: [
        "Act a reader designer",
        "publishing packages",
        "Sometimes happy",
      ]
    },
  ]
}

const { title, subtitle, description, features } = about_content

const AboutAreaHOmeFour = () => {
  return (
    <>
      <div id="about-one-page" className="tp-about-4-area pt-150 pb-140">
        <div className="container">
          <div className="row">
            <div className="col-xl-6 col-lg-6">
              <div className="tp-about-4-left p-relative d-flex justify-content-between">
                <div className="tp-about-4-circle">
                  <span></span>
                </div>
                <div className="tp-about-4-thumb-1">
                  <div className="tp-hover-distort-wrapper">
                    <div className="canvas"></div>
                    <div className="tp-hover-distort" data-displacementimage="assets/img/webgl/10.jpg">
                      <Image className="tp-hover-distort-img front" src={about_img_1} alt="image-here" />
                      <Image className="tp-hover-distort-img back" src={about_img_1} alt="image-here" />
                    </div>
                  </div>
                </div>
                <div className="tp-about-4-thumb-2">
                  <div className="tp-hover-distort-wrapper">
                    <div className="canvas"></div>
                    <div className="tp-hover-distort" data-displacementimage="assets/img/webgl/10.jpg">
                      <Image className="tp-hover-distort-img front" src={about_img_2} alt="image-here" />
                      <Image className="tp-hover-distort-img back" src={about_img_2} alt="image-here" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="tp-about-4-right">
                <div className="tp-about-4-title-box mb-20">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right ">{title}</h3>
                </div>
                <div className="tp-about-4-text">
                  <p>{description}</p>
                </div>
                <div className="row">
                  {features.map((item, index) => (
                    <div key={index} className="col-xl-6 col-lg-6 col-md-5 col-sm-6">
                      <div className="tp-about-4-list">
                        <ul>
                          {item.item.map((li, i) => (
                            <li key={i}><i className="fa-solid fa-check"></i>{li}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                </div>
                <Link className="tp-btn-black" href="/about-us">
                  <span>Read More</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutAreaHOmeFour;