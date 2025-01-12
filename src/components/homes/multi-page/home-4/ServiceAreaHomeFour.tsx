
'use client'
import Link from 'next/link';
import service_data from '@/data/service_data';
import React, { useEffect } from 'react';

const services = service_data.filter(item => item.home === 4)

const ServiceAreaHomeFour = () => {

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
      <div id="service-one-page" className="tp-service-2-area tp-service-style-3 tp-service-style-4">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-service-2-title-box text-center mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Best Service</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">Designing the Future One <br /> Room at a Time</h3>
              </div>
            </div>
            {services.map((item, i) => (
              <div key={i} className="col-xl-4 col-lg-4 col-md-6 col-sm-6 mb-30  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay={item.delay}>
                <div className={`tp-service-2-item d-flex align-items-center ${i === 1 ? 'active' : ''}`}>
                  <div className="tp-service-2-icon">
                    <span dangerouslySetInnerHTML={{ __html: item.icon || '' }}></span>
                  </div>
                  <div className="tp-service-2-content">
                    <h4 className="tp-service-2-title"><Link href="/service-details">{item.title}</Link> </h4>
                    <div className="tp-service-2-text">
                      <p>{item.description}</p>
                      <Link href="/service-details">Read More</Link>
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

export default ServiceAreaHomeFour;