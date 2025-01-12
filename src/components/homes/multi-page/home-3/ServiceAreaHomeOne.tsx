

import React from 'react';
import Link from 'next/link';
import service_data from '@/data/service_data';

const data = service_data.filter(item => item.home === 1)

interface DataType {
  subtitle: string;
  title: string;
}

const service_content: DataType = {
  subtitle: "Best Service",
  title: "Designing the Future One Room at a Time",
}
const { subtitle, title } = service_content


const ServiceAreaHomeOne = () => {
  return (
    <>
      <div id="service-one-page" className="tp-service-2-area p-relative pt-140 pb-115">
        <div className="container">
          <div className="row">
            <div className="col-xxl-7 col-xl-6">
              <div className="tp-service-2-title-box mb-60">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
              </div>
            </div>
          </div>
          <div className="row">
            {data?.map((item, i) => (
              <div key={i} className="col-xl-4 col-lg-4 col-md-6 mb-30 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay={item.delay}>
                <div className="tp-service-2-item">
                  <div className="tp-service-2-icon">
                    <span dangerouslySetInnerHTML={{ __html: item.icon || '' }}></span>
                  </div>
                  <div className="tp-service-2-content">
                    <h4 className="tp-service-2-title"><Link href="/service-details">{item.title}</Link></h4>
                    <div className="tp-service-2-text">
                      <p>{item.description}</p>
                      <Link className="tp-link" href="/service-details">Read More
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

export default ServiceAreaHomeOne;