

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

import image_1 from "@/assets/img/about/thumb-5-1.jpg";
import image_2 from "@/assets/img/about/thumb-5-2.jpg";
import image_3 from "@/assets/img/about/shape-5-1.png";


interface DataType {
  subtitle: string;
  title: string;
  description: string;
  features: {
    item: string[];
  }[];
}

const about_content: DataType = {
  subtitle: `About Us`,
  title: `Where Imagination Meets Interiors`,
  description: `Nulla vitae ex nunc. Morbi quis purus convallis, fermentum hio metus volutpat design sodales purus. Nunc quis an mauris et eros vulputate mattis Nulla vitae ex nunc. Morbi quis purus convallis, fermentum metus`,
  features: [
    {
      item: [
        `Urban Elegance Interiors`,
        `Home stead Harmony`,
      ]
    },
    {
      item: [
        `Serenity Space Design Co`,
        `Your Startup design`,
      ]
    }
  ]
}

const { subtitle, title, description, features } = about_content

const AboutAreaHomeFive = () => {
  return (
    <>
      <div id="about-one-page" className="tp-about-5-area tp-about-5-style p-relative pb-150">
        <div className="tp-about-5-big-text d-none d-xl-block">
          <h6>About Us</h6>
        </div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-6 col-lg-6 col-md-6">
              <div className="tp-about-content">
                <div className="tp-about-title-box mb-20">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
                </div>
                <div className="tp-about-text mb-25">
                  <p>{description}</p>
                </div>
                <div className="tp-about-list-wrap mb-35">
                  <div className="row">
                    {features.map((item, i) => (
                      <div className="col-xl-6" key={i}>
                        <div className="tp-about-list">
                          <ul>
                            {item.item.map((feature, index) => (
                              <li key={index}><i className="fa-sharp fa-solid fa-circle-check"></i>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Link className="tp-btn-black" href="/about-us">
                  <span>Read More</span>
                </Link>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6">
              <div className="tp-about-5-thumb-box p-relative">
                <div className="tp-about-5-thumb p-relative">
                  <div className="tp-hover-distort-wrapper">
                    <div className="canvas"></div>
                    <div className="tp-hover-distort" data-displacementimage="assets/img/webgl/10.jpg">
                      <Image className="tp-hover-distort-img front" src={image_1} alt="image-here" />
                      <Image className="tp-hover-distort-img back" src={image_1} alt="image-here" />
                    </div>
                  </div>
                  <div className="tp-about-5-shape-1">
                    <Image src={image_3} alt="image-here" />
                  </div>
                </div>
                <div className="tp-about-5-thumb-sm">
                  <div className="tp-hover-distort-wrapper">
                    <div className="canvas"></div>
                    <div className="tp-hover-distort" data-displacementimage="assets/img/webgl/10.jpg">
                      <Image className="tp-hover-distort-img front" src={image_2} alt="image-here" />
                      <Image className="tp-hover-distort-img back" src={image_2} alt="image-here" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutAreaHomeFive;