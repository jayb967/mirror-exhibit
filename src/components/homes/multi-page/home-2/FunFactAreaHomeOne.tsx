
import React from 'react';
import Image from 'next/image';
import funfact_img from '@/assets/img/funfact/thumb-2-1.jpg'
import Count from '@/components/common/Count';


interface DataType {
  count: number;
  title: React.JSX.Element;
}

const funfact_data: DataType[] = [
  {
    count: 40,
    title: <>Award Won For <br /> Our Quality</>,
  },
  {
    count: 18,
    title: <>Satisficed <br /> Client review</>,
  },
  {
    count: 10,
    title: <>projects Has <br /> Been Completed</>,
  },
  {
    count: 5,
    title: <>Years Of Positive <br /> Experience</>,
  }
]

const FunFactAreaHomeOne = () => {
  return (
    <>
      <div className="tp-funfact-2-area pb-150">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-2 col-lg-3 col-md-4">
              <div className="tp-funfact-2-item-box">
                <ul>
                  {funfact_data.map((item, i) => (
                    <li key={i}>
                      <div className="tp-funfact-2-item  text-center text-md-start">
                        <h5 className="tp-funfact-2-title d-flex">
                          <i className="purecounter">
                            <Count number={item.count} />
                          </i>k</h5>
                        <span>{item.title}</span>
                      </div>
                    </li>
                  ))} 
                </ul>
              </div>
            </div>
            <div className="col-xl-10 col-lg-9 col-md-8">
              <div className="tp-funfact-2-thumb text-end">
                <Image src={funfact_img} alt="image-here" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FunFactAreaHomeOne;