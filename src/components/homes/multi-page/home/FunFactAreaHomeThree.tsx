

import Count from '@/components/common/Count';
import React from 'react';

const funfact_content = {
  title: <>Our  <br /> Excellence</>,
  counter_data: [
    {
      count: 1200,
      title: <>Handmade  <br /> to perfection</>,
    },
    {
      count: 100,
      title: <>% Customer <br />Satisfaction</>,
    },
    {
      count: 5,
      title: <> star reviews <br /> Quality you can trust</>,
    }
  ]
}

const { title, counter_data } = funfact_content

const FunFactAreaHomeThree = () => {
  return (
    <>
      <div className="tp-funfact-area tp-funfact-style-2 tp-funfact-height theme-bg fix p-relative pt-75 pb-75">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-5 col-lg-5 col-md-5">
              <div className="tp-funfact-title-box">
                <h3 className="tp-section-title text-white tp-split-text tp-split-in-right">{title}</h3>
              </div>
            </div>
            <div className="col-xl-7 col-lg-7 col-md-7">
              <div className="tp-funfact-wrap d-flex justify-content-between">
                {counter_data.map((item, i) => (
                  <div key={i} className="tp-funfact-item p-relative">
                    <h6 className="tp-funfact-number d-flex"><i className="purecounter">
                      <Count number={item.count} />
                    </i></h6>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FunFactAreaHomeThree;