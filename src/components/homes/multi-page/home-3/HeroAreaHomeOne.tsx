
'use client'

import React from 'react';
import Count from '@/components/common/Count';


interface DataType {
  title_1: string;
  title_2: React.JSX.Element;
  email: string;
  phone: string;
  count_data: {
      count: number;
      title: string;
  }[];
}

const hero_content: DataType = {
  title_1: "Transform Your",
  title_2:  <>Living <br /> Space into a Sanctuary</>,
  email: 'info@example.com',
  phone: '(629) 555-0129',
  count_data: [
    {
      count: 100,
      title: `Complete project`,
    },
    {
      count: 800,
      title: `Client review`,
    },
  ]
}

const { title_1, title_2, email, phone, count_data } = hero_content

const HeroAreaHomeOne = () => {
  return (
    <>
      <div className="tp-hero-area tp-hero-pt">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-hero-wrap text-center">
                <h1 className="tp-hero-title tp-split-text tp-split-in-down">
                  {title_1} {' '}
                  <span>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M34.9453 16.8345L29.834 15.3739C27.5323 14.725 25.4356 13.4962 23.7446 11.8052C22.0536 10.1142 20.8248 8.01751 20.1759 5.71578L18.7153 0.604532C18.6418 0.425707 18.5168 0.272755 18.3563 0.165114C18.1957 0.0574721 18.0067 0 17.8134 0C17.6201 0 17.4311 0.0574721 17.2705 0.165114C17.1099 0.272755 16.985 0.425707 16.9115 0.604532L15.4509 5.71578C14.802 8.01751 13.5732 10.1142 11.8822 11.8052C10.1912 13.4962 8.0945 14.725 5.79277 15.3739L0.681516 16.8345C0.485261 16.8902 0.312532 17.0084 0.189539 17.1712C0.0665451 17.334 0 17.5324 0 17.7364C0 17.9404 0.0665451 18.1389 0.189539 18.3016C0.312532 18.4644 0.485261 18.5826 0.681516 18.6383L5.79277 20.0989C8.0945 20.7478 10.1912 21.9766 11.8822 23.6676C13.5732 25.3586 14.802 27.4553 15.4509 29.757L16.9115 34.8683C16.9672 35.0645 17.0854 35.2373 17.2482 35.3603C17.4109 35.4833 17.6094 35.5498 17.8134 35.5498C18.0174 35.5498 18.2158 35.4833 18.3786 35.3603C18.5414 35.2373 18.6596 35.0645 18.7153 34.8683L20.1759 29.757C20.8248 27.4553 22.0536 25.3586 23.7446 23.6676C25.4356 21.9766 27.5323 20.7478 29.834 20.0989L34.9453 18.6383C35.1415 18.5826 35.3142 18.4644 35.4372 18.3016C35.5602 18.1389 35.6268 17.9404 35.6268 17.7364C35.6268 17.5324 35.5602 17.334 35.4372 17.1712C35.3142 17.0084 35.1415 16.8902 34.9453 16.8345Z"
                        fill="currentcolor" />
                    </svg>
                  </span> {' '}
                  {title_2}
                </h1>
                <div className="tp-hero-thumb-box p-relative">
                  <div className="tp-hero-thumb">
                    <img src="assets/img/hero/hero-1-1.jpg" alt="image-here" />
                  </div>
                  <div className="tp-hero-contact-wrap">
                    <div className="tp-hero-contact-box text-end">
                      <span>Contact :</span>
                      <a href={`mailto:${email}`}>{email}</a>
                      <a className="d-inline-block" href={`tel:${phone}`}>{phone}</a>
                    </div>
                  </div>
                  <div className="tp-hero-funfact-wrap text-start">
                    <div className="tp-hero-funfact-box">
                      {count_data.map((data, i) => (
                        <div className={`tp-hero-funfact ${i === 0 ? 'mb-30' : ''}`} key={i}>
                          <h5 className="d-flex">
                            <i className="purecounter">
                              <Count number={data.count}  /> </i>  +
                          </h5>
                          <span>{data.title}</span>
                        </div>
                      ))} 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroAreaHomeOne;