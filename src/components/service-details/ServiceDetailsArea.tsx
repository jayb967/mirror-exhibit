
import React from 'react';
import Image from 'next/image';

import service_details_img_1 from "@/assets/img/service/details-1-1.jpg";
import service_details_img_2 from "@/assets/img/service/service-1-6.jpg";
import service_details_img_3 from "@/assets/img/service/service-1-7.jpg";
import service_details_img_4 from "@/assets/img/service/service-1-8.jpg";
import Link from 'next/link';

const service_content = {
  title: `Home with Stunning Interior Design`,
  description: `Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere they a lobortis viverra laoreet augue mattis fermentum ullamcorper viverra laoreet Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis non Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere they a lobortis viverra laoreet augue mattis fermentum ullamcorper viverra laoreet Aliquam eros justo`,
  features: [
    {
      title: `Best TransformSpace`,
      description: <>ished fact that a reader will be distrol acted <br /> bioiiy desig ished fact that a reader will.</>,
    },
    {
      title: `Best TransformSpace`,
      description: <>ished fact that a reader will be distrol acted bioiiy desig ished fact that a reader will.</>,
    },
  ],
  title_2: `Home with Stunning Interior Design`,
  description_2: `Aliquam eros justo, posuere loborti vive rra laoreet matti ullamc orper posu ere viverra .Aliquam eros justo, posuere the lobortis non, vive rra laoreet augue mattis fermentum ullamcorper viverra laoreet Aliquam eros justo, posuere loborti of viverra laoreet mat ullamcorper posue viverra .Aliquam eros justo, posuere lobortis non, viverra laoreet augue mattis. Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra.`,
  qute: `Aliquam eros justo, posuere loborti vive rra laoreet matti ullamc orper posu ere viverra desig liquam eros justo, posuere lobortis non, vive rra laoreet augue mattis fermentum ullamonio corper viverra laoreet Aliquam eros justo, posuere loborti viverra laoreet mat ullamcorper posue viverra .Aliquam`,
  features_list: [
    {
      title: `Design make for you.`,
      description: `ished fact that a reader will be distrol acted bioiiy desig the.ished fact that a reader will be distrol acted bioiiy bioiiy desig the.ished fact that a reader.`
    },
    {
      title: `Finished the process`,
      description: `ished fact that a reader will be distrol acted bioiiy desig the.ished fact that a reader will be distrol acted bioiiy bioiiy desig the.ished fact that a reader.`
    },
  ],
  sidebar_list: [
    `Experience Style`,
    `Create Oasis`,
    `Discover Art`,
    `Redefine Comfort`,
    `Unlock Potential`,
  ],
  info: `Aliquam eros justo, posuere loborti laoreet matti ullamcorper posuere viverra Aliqueros justo, posuere lobortis non`,
  name: `Kiano rafter sheikh`,
  designation: `Ceo of company`,

}

const { title, description, features, title_2, description_2, qute, features_list, sidebar_list, info, name, designation } = service_content


const ServiceDetailsArea = () => {
  return (
    <>
      <div className="tp-sv-details-area pt-150 pb-150">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-sv-details-wrap">
                <div className="tp-sv-details-thumb">
                  <Image src={service_details_img_1} alt="image-here" />
                </div>
                <div className="row">
                  <div className="col-xl-8 col-lg-8">
                    <div className="tp-sv-details-content pt-45">
                      <h4 className="tp-sv-details-title pb-15">{title}</h4>
                      <div className="tp-sv-details-text pb-10">
                        <p>{description}</p>
                      </div>
                      <div className="row">
                        {features.map((item, i) => (
                          <div key={i} className="col-lg-6 col-md-6 mb-40">
                            <div className="tp-sv-details-left">
                              <h6>
                                ✓
                                {item.title}
                              </h6>
                              <p>{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="row">
                        <div className="col-lg-6 col-md-6 mb-35">
                          <div className="tp-sv-details-thumb">
                            <Image src={service_details_img_2} alt="image-here" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6 mb-35">
                          <div className="tp-sv-details-thumb">
                            <Image src={service_details_img_3} alt="image-here" />
                          </div>
                        </div>
                      </div>
                      <h4 className="tp-sv-details-title pb-30">{title_2}</h4>
                      <div className="tp-sv-details-text pb-15">
                        <p>{description_2}</p>
                      </div>
                      <div className="tp-sv-details-text d-flex align-items-center pb-50">
                        <span>
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M15.4023 19.4511L14.5715 19.107C14.387 19.0306 14.2427 18.8855 14.1652 18.6983C13.8994 18.0921 14.545 17.4544 15.1486 17.714L15.564 17.886C16.5341 18.2473 17.104 16.8737 16.162 16.4424L15.7465 16.2703C13.8545 15.4857 11.9302 17.4006 12.7216 19.2962C13.1396 20.2967 13.887 20.5221 14.8044 20.8947C15.1884 21.0537 15.3714 21.4957 15.2123 21.8798C15.0669 22.2539 14.5948 22.4497 14.2273 22.2879L13.812 22.1158C13.4135 21.9507 12.9563 22.1399 12.7912 22.5386C12.626 22.9372 12.8153 23.3942 13.214 23.5594L13.6295 23.7315C14.7679 24.2304 16.2045 23.6346 16.6559 22.4777C17.1447 21.2976 16.5823 19.9399 15.4023 19.4511Z"
                              fill="currentcolor" />
                            <path
                              d="M20.227 19.452L19.3962 19.1079C19.2117 19.0315 19.0674 18.8864 18.9899 18.6992C18.7242 18.0928 19.3696 17.4554 19.9732 17.7148L20.3886 17.8869C21.3586 18.2482 21.9286 16.8747 20.9866 16.4434L20.5712 16.2712C19.4344 15.7723 17.9954 16.368 17.5447 17.525C17.0456 18.6617 17.6415 20.1005 18.7983 20.5514L19.6292 20.8956C20.0132 21.0546 20.1962 21.4965 20.0371 21.8807C19.8781 22.2647 19.4361 22.4478 19.0521 22.2887L18.6367 22.1166C18.2383 21.9515 17.7811 22.1407 17.616 22.5394C17.4508 22.938 17.6401 23.395 18.0388 23.5602L18.4542 23.7323C21.3329 24.7883 23.0245 20.7582 20.227 19.452Z"
                              fill="currentcolor" />
                            <path
                              d="M25.1094 16.0938H23.5469C23.1155 16.0938 22.7656 16.4435 22.7656 16.875V23.125C22.7656 23.5565 23.1155 23.9062 23.5469 23.9062H25.1094C26.4017 23.9062 27.453 22.8548 27.453 21.5625V18.4375C27.453 17.1452 26.4017 16.0938 25.1094 16.0938ZM25.8905 21.5625C25.8905 21.9933 25.5402 22.3438 25.1094 22.3438H24.3281V17.6562H25.1094C25.5402 17.6562 25.8905 18.0067 25.8905 18.4375V21.5625Z"
                              fill="currentcolor" />
                            <path
                              d="M28.2031 12.9688H11.7969C10.5045 12.9688 9.45312 14.0202 9.45312 15.3125V24.6875C9.45312 25.9798 10.5045 27.0312 11.7969 27.0312H28.2031C29.4954 27.0312 30.5467 25.9798 30.5467 24.6875V15.3125C30.5467 14.0202 29.4954 12.9688 28.2031 12.9688ZM28.9842 24.6875C28.9842 25.1182 28.6338 25.4687 28.2031 25.4687H11.7969C11.3661 25.4687 11.0156 25.1182 11.0156 24.6875V15.3125C11.0156 14.8817 11.3661 14.5312 11.7969 14.5312H28.2031C28.6338 14.5312 28.9842 14.8817 28.9842 15.3125V24.6875Z"
                              fill="currentcolor" />
                            <path
                              d="M32.4999 0H7.49999C6.20765 0 5.15625 1.0514 5.15625 2.34374V37.6563C5.15625 38.9486 6.20765 40 7.49999 40H32.4999C33.7922 40 34.8436 38.9486 34.8436 37.6563V2.34374C34.8436 1.0514 33.7922 0 32.4999 0ZM7.49991 1.56249H32.4998C32.9306 1.56249 33.281 1.91296 33.281 2.34374V4.68748H6.71859V2.34374C6.71867 1.91296 7.06913 1.56249 7.49991 1.56249ZM28.9842 38.4375H26.6405V35.3125H28.203C28.6338 35.3125 28.9842 35.663 28.9842 36.0938V38.4375ZM25.078 38.4375H22.7342V35.3125H25.078V38.4375ZM21.1717 38.4375H18.828V35.3125H21.1717V38.4375ZM17.2655 38.4375H14.9218V35.3125H17.2655V38.4375ZM13.3593 38.4375H11.0155V36.0937C11.0155 35.6629 11.366 35.3124 11.7968 35.3124H13.3593V38.4375ZM32.4999 38.4375H30.5467V36.0937C30.5467 34.8013 29.4954 33.7499 28.203 33.7499H11.7968C10.5045 33.7499 9.45311 34.8013 9.45311 36.0937V38.4375H7.49999C7.06921 38.4375 6.71874 38.087 6.71874 37.6563V6.24998H33.2811V37.6563C33.2811 38.087 32.9306 38.4375 32.4999 38.4375Z"
                              fill="currentcolor" />
                          </svg>
                        </span>
                        <p className="mb-0">{qute}</p>
                      </div>
                      <div className="row align-items-end">
                        <div className="col-xl-7 col-lg-7 col-md-7">
                          <div className="tp-sv-details-left-wrap">
                            {features_list.map((item, i) => (
                              <div key={i} className={`tp-sv-details-left-box ${i === 0 ? 'mb-20' : ''}`}>
                                <h6>{item.title}</h6>
                                <p>{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-xl-5 col-lg-5 col-md-5">
                          <div className="tp-sv-details-thumb text-end">
                            <Image src={service_details_img_4} alt="image-here" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <div className="tp-sv-details-sidebar pt-50">
                      <div className="tp-sv-sidebar-widget mb-60">
                        <ul>
                          {sidebar_list.map((item, i) => (
                            <li key={i} className={`${i === 1 ? 'active' : ''}`}>
                              <Link href="/service-details">
                                <span>
                                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      d="M10.7656 6.03906L7.01563 9.78906C6.875 9.92969 6.6875 10 6.5 10C6.28906 10 6.10156 9.92969 5.96094 9.78906C5.65625 9.50781 5.65625 9.01562 5.96094 8.73438L8.42188 6.25L1.25 6.25C0.828125 6.25 0.5 5.92188 0.5 5.5C0.5 5.10156 0.828125 4.75 1.25 4.75L8.42188 4.75L5.96094 2.28906C5.65625 2.00781 5.65625 1.51562 5.96094 1.23437C6.24219 0.929687 6.73438 0.929687 7.01562 1.23437L10.7656 4.98437C11.0703 5.26562 11.0703 5.75781 10.7656 6.03906Z"
                                      fill="currentcolor" />
                                  </svg>
                                </span> {' '}
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="tp-sv-sidebar-author-info">
                        <p className="pb-15">{info}</p>
                        <h5>{name}</h5>
                        <span>{designation}</span>
                      </div>
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

export default ServiceDetailsArea;