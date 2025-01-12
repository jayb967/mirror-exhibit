
'use client'

import service_data from '@/data/service_data';
import Link from 'next/link';
import React, { useEffect } from 'react';

const services = service_data.filter(item => item.home === 2)

const service_content = {
  subtitle: `Best Service`,
  title: <>Designing the Future One <br /> Room at a Time</>,
}
const { subtitle, title } = service_content

const ServiceAreaHomeTwo = () => {

  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tpService2Items = document.querySelectorAll('.tp-service-2-item');

      if (target.classList.contains('tp-service-2-item')) {
        target.classList.add('active');

        // Remove 'active' class from all items except the current one
        tpService2Items.forEach(item => {
          if (item !== target) {
            item.classList.remove('active');
          }
        });
      }
    };

    const tpService2Items = document.querySelectorAll('.tp-service-2-item');

    tpService2Items.forEach(item => {
      item.addEventListener('mouseenter', handleMouseEnter as EventListenerOrEventListenerObject);
    });

    return () => {
      tpService2Items.forEach(item => {
        item.removeEventListener('mouseenter', handleMouseEnter as EventListenerOrEventListenerObject);
      });
    };

  }, []);



  return (
    <>
      <div id="service-one-page" className="tp-service-2-area tp-service-style-3 tp-service-style-5 pt-140 pb-120">
        <div className="container">
          <div className="row">

            <div className="col-xl-12">
              <div className="tp-service-2-title-box text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
              </div>
            </div>

            {services.map((item, i) => (
              <div key={i} className="col-xl-4 col-lg-4 col-md-6 mb-30  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".5s">
                <div className={`tp-service-2-item ${i === 1 ? 'active' : ''}`}>
                  <div className="tp-service-2-top-box mb-5 d-flex align-items-center">
                    <div className="tp-service-2-icon">
                      <span dangerouslySetInnerHTML={{ __html: item.icon ?? '' }}></span>
                    </div>
                    <h4 className="tp-service-2-title">
                      <Link href="/service-details">
                        <span dangerouslySetInnerHTML={{ __html: item.title }}></span>
                      </Link>
                    </h4>
                  </div>
                  <div className="tp-service-2-content">
                    <div className="tp-service-2-text pb-40">
                      <p>{item.description}</p>
                    </div>
                    <div className="tp-service-2-button">
                      <Link className="tp-btn-border-lg grey-border" href="/service-details">
                        <span>Read More
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div >
    </>
  );
};

export default ServiceAreaHomeTwo;