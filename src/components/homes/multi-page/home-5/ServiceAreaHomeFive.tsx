
'use client'

import Link from 'next/link';
import React, { useEffect } from 'react';
import service_data from '@/data/service_data';
const services = service_data.filter(item => item.home === 5)


interface DataType {
  subtitle: string;
  title: string;
  description: string;
}

const service_content:DataType = {
  subtitle: `Best Service`,
  title: `Designing the Future One Room at a Time`,
  description: `loborti viverra laoreet matti ullamcorper posuere viverr des Aliquam eros justo posuere lobortis non, Aliquam eros justo, posuere loborti viverra laorematu our`,
}

const {subtitle, title, description} = service_content



const ServiceAreaHomeFive = () => {

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
      <div id="service-one-page" className="tp-service-2-area tp-service-style-3 tp-service-style-5 p-relative pt-140 pb-120">
        <div className="tp-service-2-big-text d-none d-xxl-block">
          <h6>Service</h6>
        </div>
        <div className="container">
          <div className="tp-service-2-title-wrap mb-60">
            <div className="row align-items-end">
              <div className="col-xl-6 col-lg-6 col-md-7">
                <div className="tp-service-2-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title  tp-split-text tp-split-in-right">{title}</h3>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6 col-md-5">
                <div className="tp-service-2-top-text">
                  <p>{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {services.map((item, i) => (
              <div key={i} className="col-xl-4 col-lg-4 col-md-6 mb-30 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay={item.delay}>
                <div className={`tp-service-2-item ${i === 1 ? 'active' : ''}`}>
                  <div className="tp-service-2-top-box mb-5 d-flex align-items-center">
                    <div className="tp-service-2-icon">
                      <span dangerouslySetInnerHTML={{ __html: item.icon ?? '' }}></span>
                    </div>
                    <h4 className="tp-service-2-title">
                      <Link href="/service-details" dangerouslySetInnerHTML={{ __html: item.title ?? '' }}></Link>
                      </h4>
                  </div>
                  <div className="tp-service-2-content">
                    <div className="tp-service-2-text pb-40">
                      <p>{item.description}</p>
                    </div>
                    <div className="tp-service-2-button">
                      <Link className="tp-btn-border-lg grey-border" href="/service-details">
                        <span>Read More</span>
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

export default ServiceAreaHomeFive;