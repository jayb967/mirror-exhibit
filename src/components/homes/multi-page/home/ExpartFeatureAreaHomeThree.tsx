'use client'
import React from 'react';
import Link from 'next/link';

// import progressbar   
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";


const ExpartFeatureAreaHomeThree = () => {

  const percentage = 100;
  const percentage2 = 100;

  return (
    <>
      <div className="tp-exp-fea-area fix pb-200">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-exp-fea-title-box p-relative mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Our Features</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">The Luxury <br />Experience</h3>
                <div className="tp-exp-fea-big-text d-none d-xl-block">
                  <h6>Features</h6>
                </div>
              </div>
            </div>
          </div>
          <div className="tp-exp-fea-top mb-60">
            <div className="row align-items-center">
              <div className="col-xl-7 col-lg-7 col-md-5">
                <div className="tp-exp-fea-thumb">
                  <div className="tp-hover-distort-wrapper">
                    <div className="canvas"></div>
                    <div className="tp-hover-distort" data-displacementimage="assets/img/webgl/10.jpg">
                      <img className="tp-hover-distort-img front" src="assets/img/service/blonde_mirror3.png" alt="image-here" />
                      <img className="tp-hover-distort-img back" src="assets/img/service/blonde_mirror3.png" alt="image-here" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-5 col-lg-5 col-md-7">
                <div className="tp-exp-fea-right">
                  <div className="tp-exp-fea-text pb-5">
                    <p>Our mirrors are more than decor; they are a lifestyle.</p>
                  </div>
                  <div className="tp-exp-fea-list mb-40">
                    <ul>
                      <li><i className="fa-solid fa-check"></i>Laser-Engraved Precision</li>
                      <li><i className="fa-solid fa-check"></i>High-End Materials</li>
                      <li><i className="fa-solid fa-check"></i>Multiple Size Options</li>
                      <li><i className="fa-solid fa-check"></i>Custom Branding Available</li>
                    </ul>
                  </div>
                  <Link className="tp-btn-black" href="/shop">
                    <span>Shop Now</span>
                  </Link> 
                </div>
              </div>
            </div>
          </div>
          <div className="tp-exp-fea-bottom">
            <div className="row align-items-center">
              <div className="col-xl-5 col-lg-5 col-md-6 order-1 order-md-0">
                <div className="tp-exp-fea-right">
                  <div className="tp-exp-fea-text pb-5">
                    <p>Crafted with care, built for those who appreciate the finer things.</p>
                  </div>

                  <div className="tp-exp-fea-wrap d-flex justify-content-between mb-40">
                    <div className="tp-exp-fea-canva-box">
                      <div className="tp-exp-fea-canva tp-progress">
                        <CircularProgressbar
                          value={percentage}
                          text={`${percentage}%`}
                          strokeWidth={7}
                          className="knob" 
                        />

                      </div>
                      <span>Attention to Detail</span>
                    </div>
                    <div className="tp-exp-fea-canva-box">
                      <div className="tp-exp-fea-canva tp-progress">
                        <CircularProgressbar
                          value={percentage2}
                          text={`${percentage2}%`}
                          strokeWidth={7}
                        />

                      </div>
                      <span>Luxury Materials</span>
                    </div>
                  </div>


                  <Link className="tp-btn-black" href="/shop">
                    <span>Shop Now</span>
                  </Link> 

                </div>
              </div>
              <div className="col-xl-7 col-lg-7 col-md-6 order-0 order-md-1">
                <div className="tp-exp-fea-thumb-2 text-end">
                  <div className="tp-hover-distort-wrapper">
                    <div className="canvas"></div>
                    <div className="tp-hover-distort" data-displacementimage="assets/img/webgl/10.jpg">
                      <img className="tp-hover-distort-img front" src="assets/img/service/service-1-2.webp" alt="image-here" />
                      <img className="tp-hover-distort-img back" src="assets/img/service/service-1-2.webp" alt="image-here" />
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

export default ExpartFeatureAreaHomeThree;