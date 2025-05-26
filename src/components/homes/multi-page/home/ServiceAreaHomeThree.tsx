

import service_data from '@/data/service_data';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const services = service_data.filter(item => item.home === 3)

const ServiceAreaHomeThree = () => {
  return (
    <>
      <div id="service-one-page" className="tp-service-area pt-75 pb-75">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-service-title-box text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Elegance</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">Impressive <br /> In Every Room</h3>
              </div>
            </div>

            {services.map((item, i) => (
              <div key={i} className="col-xl-4 col-lg-4 col-md-6 mb-30 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay={item.delay}>
                <div className="tp-service-item">
                  <div className="tp-service-thumb-box p-relative">
                    <div className="tp-service-thumb">
                      <Image style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        aspectRatio: '1 / 1'
                      }} src={item.img ?? ''} alt="image-here" />
                    </div>
                    <div className="tp-service-icon">
                      <span dangerouslySetInnerHTML={{ __html: item.icon ?? '' }}>

                      </span>
                    </div>
                  </div>
                  <div className="tp-service-content">
                    <h4 className="tp-service-title">
                      <Link href="/shop">{item.title}</Link></h4>
                    <p>{item.description}</p>
                    <div className="tp-service-link">
                      <Link className="tp-link" href="/shop">
                        Shop Now
                        <span className="bottom-line"></span>
                      </Link>
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

export default ServiceAreaHomeThree;