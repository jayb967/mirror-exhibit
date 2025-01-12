

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import service_data from '@/data/service_data';

const services = service_data.filter(item => item.home === 4.2)

const BestServiceAreaHomeThree = () => {
  return (
    <>
      <div className="tp-service-area tp-service-style-2 pt-110 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-service-title-box text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Best Service</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right"> Enhance Your Lifestyle with <br /> Interior Design</h3>
              </div>
            </div>
            {services.map((item, i) => (
              <div key={i} className="col-xl-4 col-lg-4 col-md-6 col-sm-6 mb-30 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay={item.delay}>
                <div className="tp-service-item">
                  <div className="tp-service-thumb-box p-relative">
                    <div className="tp-service-thumb">
                      <Image src={item.img} alt="image-here" />
                    </div>
                  </div>
                  <div className="tp-service-content text-center">
                    <div className="tp-service-icon-box mb-20">
                      <span dangerouslySetInnerHTML={{ __html: item.icon ?? '' }}>
                      </span>
                    </div>
                    <h4 className="tp-service-title mb-0">
                      <Link href="/service-details">{item.title}</Link>
                    </h4>
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

export default BestServiceAreaHomeThree;