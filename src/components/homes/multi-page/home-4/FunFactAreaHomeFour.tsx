

import Count from '@/components/common/Count';
import React from 'react';

interface DataType {
  count: number;
  title: string;
}

const counter_data: DataType[] = [
  { count: 40, title: 'Winning Award' },
  { count: 18, title: 'Client Review' },
  { count: 10, title: 'Complete Project' },
  { count: 20, title: 'Years Experience' },
]

const FunFactAreaHomeFour = () => {
  return (
    <>
      <div className="tp-funfact-2-area fix grey-bg tp-funfact-style-3 pb-95">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-12">
              <div className="tp-funfact-2-item-box d-flex justify-content-between">
                {counter_data.map((item, i) => (
                  <div key={i} className="tp-funfact-2-item text-center">
                    <h5 className="tp-funfact-2-title d-flex justify-content-center">
                      <i className="purecounter">
                        <Count number={item.count} />
                      </i>k</h5>
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

export default FunFactAreaHomeFour;