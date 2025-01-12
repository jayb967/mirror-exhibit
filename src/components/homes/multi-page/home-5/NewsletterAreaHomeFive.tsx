

import React from 'react';
import Image from 'next/image';
import img_1 from '@/assets/img/newsletter/shape-1-1.png';

const NewsletterAreaHomeFive = () => {
  return (
    <>
      <div className="tp-newsletter-area theme-bg p-relative pt-70 pb-80">
        <div className="tp-newsletter-shape-1">
          <Image src={img_1} alt="image-here" />
        </div>
        <div className="container">
          <div className="tp-newsletter-wrap">
            <div className="row align-items-center">
              <div className="col-xl-6 col-lg-6">
                <div className="tp-newsletter-content">
                  <h4 className="tp-newsletter-title mb-0 tp-split-text tp-split-in-right">
                    Subscribe newsletter <br /> For Any Update
                  </h4>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6">
                <div className="tp-newsletter-input-wrap d-flex align-items-center justify-content-lg-end">
                  <div className="tp-newsletter-input-box p-relative">
                    <input type="email" placeholder="Enter Your Email" />
                    <div className="tp-newsletter-input-icon">
                      <span><i className="fa-solid fa-envelope"></i></span>
                    </div>
                  </div>
                  <div className="tp-newsletter-button text-md-end">
                    <button className="tp-btn-black hover-2">
                      <span>Suscribe Now
                      </span>
                    </button>
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

export default NewsletterAreaHomeFive;