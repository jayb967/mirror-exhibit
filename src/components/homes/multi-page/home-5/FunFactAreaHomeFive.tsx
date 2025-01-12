

import React from 'react';
import Count from '@/components/common/Count';


interface DataType {
  count: number;
  title: string;
}

const counter_data: DataType[] = [
  {
    count: 40,
    title: `Award Won For <br /> Our Quality`,
  },
  {
    count: 18,
    title: `Satisficed <br /> Client review`,
  },
  {
    count: 10,
    title: `projects Has <br /> Been Completed `,
  },
  {
    count: 20,
    title: `Years Of Positive <br /> Experience `,
  },
]

const FunFactAreaHomeFive = () => {
  return (
    <>
      <div className="tp-funfact-2-area tp-funfact-style-4 p-relative grey-bg pt-85 pb-80">
        <div className="tp-funfact-2-big-text d-none d-xl-block">
          <h6>COUNTER</h6>
        </div>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-12">
              <div className="tp-funfact-2-item-box d-flex justify-content-between align-items-center z-index">

                {counter_data.map((item, i) => (
                  <div key={i} className="tp-funfact-2-item  text-center">
                    <h5 className="tp-funfact-2-title d-flex justify-content-center">
                      <i className="purecounter">
                        <Count number={item.count} />
                      </i>k</h5>
                    <span dangerouslySetInnerHTML={{ __html: item.title }}></span>
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

export default FunFactAreaHomeFive;