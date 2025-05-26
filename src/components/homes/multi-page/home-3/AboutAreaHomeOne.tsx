
'use client'
import React from 'react';
import Link from 'next/link';
import Image from "next/image";

interface StyleType {
  style_2: boolean
}


interface DataType {
  subtitle: string;
  title: string;
  description: string;
  features: string[];
}

const about_content: DataType = {
  subtitle: `About Us`,
  title: `Crafting Luxury Mirrors for Unique Spaces`,
  description: `We specialize in creating bespoke, laser-engraved mirrors that reflect elegance, precision, and your personal style.`,
  features: [
    `Premium quality craftsmanship`,
    `Tailored designs for your space`,
    `Tailored designs for your space`,
  ]
}

const { subtitle, title, description, features } = about_content

const AboutAreaHomeOne = ({ style_2 }: StyleType) => {


  return (
    <>
      <div id="about-one-page" className={`tp-about-area tp-about-bg p-relative grey-bg ${style_2 ? 'mt-120 pb-120' : 'pb-150'}`}>
        <div className="tp-about-big-text d-none d-xl-block">
          <h6>{subtitle}</h6>
        </div>
        <div className="container">
          <div className="row align-items-end">
            <div className="col-xl-6 col-lg-6 order-1 order-lg-0">
              <div className="tp-about-thumb-box z-index">
                {/* Test with simple img tag first */}
                <img
                  src="/assets/img/about/IMG_7339.jpg"
                  alt="About us - Crafting luxury mirrors"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    console.error('Image failed to load:', e.currentTarget.src);
                    e.currentTarget.src = '/assets/img/logo/ME_Logo.png'; // fallback
                  }}
                  onLoad={() => console.log('Image loaded successfully:', '/assets/img/about/IMG_7339.jpg')}
                />

                <div className="tp-hover-distort-wrapper" style={{ display: 'none' }}>
                  <div className="canvas"></div>
                  <div className="tp-hover-distort" data-displacementimage="assets/img/webgl/10.jpg">
                    <Image
                      className="tp-hover-distort-img front"
                      src="/assets/img/about/IMG_7339.jpg"
                      alt="About us - Crafting luxury mirrors"
                      width={600}
                      height={400}
                      priority
                      unoptimized
                      style={{ width: '100%', height: 'auto' }}
                    />
                    <Image
                      className="tp-hover-distort-img back"
                      src="/assets/img/about/IMG_7339.jpg"
                      alt="About us - Crafting luxury mirrors"
                      width={600}
                      height={400}
                      unoptimized
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 order-0 order-lg-1">
              <div className="tp-about-content">
                <div className="tp-about-title-box mb-20">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
                </div>
                <div className="tp-about-text mb-25">
                  <p>{description}</p>
                </div>
                <div className="tp-about-list mb-35">
                  <ul>
                    {features.map((feature, index) => (
                      <li key={index}><i className="fa-light fa-check"></i>{feature}</li>
                    ))}
                  </ul>
                </div>
                <Link className="tp-btn-black" href="/shop">
                  <span>Shop</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="offset-xl-3 offset-lg-3 col-xl-6 col-lg-6 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".3s">
              <div className="tp-about-thumb-boxs z-index text-center mt-80">
                {/* Test with simple img tag first */}
                <img
                  src="/assets/img/about/IMG_7182.jpg"
                  alt="About us - Mirror craftsmanship"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  onError={(e) => {
                    console.error('Image failed to load:', e.currentTarget.src);
                    e.currentTarget.src = '/assets/img/logo/ME_Logo.png'; // fallback
                  }}
                  onLoad={() => console.log('Image loaded successfully:', '/assets/img/about/IMG_7182.jpg')}
                />

                <div className="tp-hover-distort-wrapper" style={{ display: 'none' }}>
                  <div className="canvas"></div>
                  <div className="tp-hover-distort" data-displacementimage="assets/img/webgl/10.jpg">
                    <Image
                      className="tp-hover-distort-img front"
                      src="/assets/img/about/IMG_7182.jpg"
                      alt="About us - Mirror craftsmanship"
                      width={600}
                      height={400}
                      unoptimized
                      style={{ width: '100%', height: 'auto' }}
                    />
                    <Image
                      className="tp-hover-distort-img back"
                      src="/assets/img/about/IMG_7182.jpg"
                      alt="About us - Mirror craftsmanship"
                      width={600}
                      height={400}
                      unoptimized
                      style={{ width: '100%', height: 'auto' }}
                    />
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

export default AboutAreaHomeOne;