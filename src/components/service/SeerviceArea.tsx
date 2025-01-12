

import service_data from '@/data/service_data';
import Link from 'next/link';
import React from 'react';

const services = service_data.filter(item => item.home === 'service')

const SeerviceArea = () => {
  return (
    <>
      <div className="tp-service-2-area pt-140 pb-45">
        <div className="container">
          <div className="row"> 
            {services.map((item, i) => (
              <div key={i} className="col-xl-4 col-lg-4 col-md-6 mb-90  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay={item.delay}>
                <div className="tp-service-2-item active">
                  <div className="tp-service-2-icon">
                    <span dangerouslySetInnerHTML={{ __html: item.icon ?? '' }}></span>
                  </div>
                  <div className="tp-service-2-content">
                    <h4 className="tp-service-2-title"><Link href="/service-details">{item.title}</Link></h4>
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

export default SeerviceArea;