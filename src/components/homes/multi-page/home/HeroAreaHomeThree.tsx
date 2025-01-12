

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

import shape_1 from "@/assets/img/hero/shape-1.png"
import hero_2 from "@/assets/img/hero/hero-2-1.jpg"
import shape_3 from "@/assets/img/hero/shape-2-1.png"
import shape_4 from "@/assets/img/hero/shape-2-2.png"
import Count from '@/components/common/Count';


const hero_content = {
  title: <>Living with <br /> Modern <span>Interior</span> <br /> Concepts</>,
  info: <>Dolen Son The dolor sit amet, consectetur adipiscing elit. Sed sit amet rhoncus nunc Duis egestas ac ante sed tincidunt. Maecena Dolen</>,
  counter_data: [
    {
      count: 40,
      title: `Winning award`,
    },
    {
      count: 100,
      title: `Complete project`,
    },
    {
      count: 800,
      title: `Client reviewt`,
    },
  ]

}

const { title, info, counter_data } = hero_content

const HeroAreaHomeThree = () => {
  return (
    <>
      <div className="tp-hero-2-area tp-hero-2-height fix grey-bg p-relative">
        <div className="tp-hero-2-shape-1">
          <Image src={shape_1} alt="image-here" />
        </div>
        <div className="container">
          <div className="tp-hero-2-wrap p-relative z-index">
            <div className="row">
              <div className="col-xl-6 col-lg-6">
                <div className="tp-hero-2-content">
                  <h1 className="tp-slider-title text-black mb-15 tp-split-text tp-split-in-down">
                    {title}
                  </h1>
                  <p className="mb-35">
                    {info}
                  </p>
                  <Link className="tp-btn-black" href="/about-us">
                    <span>Read More</span>
                  </Link>
                </div>
              </div>
              <div className="col-xl-6 col-lg-6">
                <div className="tp-hero-2-thumb-box p-relative text-center text-lg-end">
                  <div className="tp-hero-2-thumb">
                    <Image src={hero_2} alt="image-here" />
                  </div>
                  <div className="tp-hero-2-shape-2">
                    <Image src={shape_3} alt="image-here" />
                  </div>
                  <div className="tp-hero-2-shape-3">
                    <Image src={shape_4} alt="image-here" />
                  </div>
                </div>
              </div>
              <div className="col-xl-12">
                <div className="tp-hero-2-funfact-box d-flex justify-content-between">
                  {counter_data.map((item, i) => (
                      <div key={i} className="tp-hero-2-funfact">
                        <h5 className="d-flex">
                          <i className="purecounter">
                          <Count number={item.count} />
                          </i>k
                        </h5>
                        <span>{item.title}</span>
                      </div>
                    ))
                  }

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroAreaHomeThree;