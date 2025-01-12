

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import logo from "@/assets/img/logo/logo-white.png";
import { CopyRight } from '@/components/common/SocialLinks';


interface DataType {
  description: string;
  page_title: string;
  pages: {
    title: string;
    link: string;
  }[];
  info_title: string;
  address: React.JSX.Element;
  phone: string;
  email: string;
  news_title: string;
  news_info: string;
}

const footer_content: DataType = {
  description: `Corporate business typically refers to large-scale enterp mansola it organizat enterprises or organizat`,
  page_title: `Pages`,
  pages: [
    { title: 'About Us', link: '/about-us' },
    { title: 'Our Team', link: '/team' },
    { title: 'Recent News', link: '/blog' },
  ],
  info_title: `Office Information`,
  address: <>1901 Thornridge Cir. <br /> Shiloh 81063</>,
  phone: '(201) 555-0124',
  email: 'abggcd@gmail.com',
  news_title: `Newsletter`,
  news_info: `Lorem Ipsum is simply dummy text the printing and typesetting industry`,
}

const { description, page_title, pages, info_title, address, phone, email, news_title, news_info } = footer_content

const FooterFive = () => {
  return (
    <>
      <footer>
        <div className="tp-footer-area tp-footer-style-2 tp-footer-style-5 black-bg pt-75 pb-50">
          <div className="container">
            <div className="row">
              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-50  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".3s">
                <div className="tp-footer-widget footer-cols-5-1">
                  <div className="tp-footer-logo">
                    <Link href="/">
                      <Image src={logo} alt="image-here" />
                    </Link>
                  </div>
                  <div className="tp-footer-text pb-5">
                    <p>{description}</p>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-50  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".5s">
                <div className="tp-footer-widget footer-cols-5-2">
                  <h4 className="tp-footer-title">{page_title}</h4>
                  <div className="tp-footer-list">
                    <ul>
                      {pages.map((item, i) => (
                        <li key={i}><Link href={item.link}>{item.title}</Link></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-50  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".7s">
                <div className="tp-footer-widget footer-cols-5-3 d-flex justify-content-end-4">
                  <div className="tp-footer-contact-box">
                    <h4 className="tp-footer-title">{info_title}</h4>
                    <div className="tp-footer-contact">
                      <ul>
                        <li>
                          <a
                            href="https://www.google.com/maps/place/United+States/@21.2541411,-83.1622716,7.17z/data=!4m6!3m5!1s0x54eab584e432360b:0x1c3bb99243deb742!8m2!3d37.09024!4d-95.712891!16zL20vMDljN3cw?entry=ttu">
                            {address}
                          </a>
                        </li>
                        <li>
                          <a href={`tel:${phone}`}> {phone} </a>
                        </li>
                        <li>
                          <a href={`mailto:${email}`}>{email}</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-50  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".9s">
                <div className="tp-footer-widget footer-cols-5-4 d-flex justify-content-lg-end">
                  <div className="tp-footer-contact-box">
                    <h4 className="tp-footer-title">{news_title}</h4>
                    <div className="tp-footer-text pb-10">
                      <p>{news_info}</p>
                    </div>
                    <div className="tp-footer-input-box">
                      <input type="email" placeholder="Email here" />
                      <div className="tp-footer-icon">
                        <span>
                          <svg width="16" height="15" viewBox="0 0 16 15" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M14.9727 1.76172L13.2227 13.1094C13.1953 13.3828 13.0312 13.6289 12.7852 13.7656C12.6484 13.8203 12.5117 13.875 12.3477 13.875C12.2383 13.875 12.1289 13.8477 12.0195 13.793L8.68359 12.3984L7.28906 14.4766C7.17969 14.668 6.98828 14.75 6.79688 14.75C6.49609 14.75 6.25 14.5039 6.25 14.2031V11.5781C6.25 11.3594 6.30469 11.168 6.41406 11.0312L12.375 3.375L4.33594 10.6211L1.51953 9.44531C1.21875 9.30859 1 9.03516 1 8.67969C0.972656 8.29688 1.13672 8.02344 1.4375 7.85938L13.6875 0.886719C13.9609 0.722656 14.3438 0.722656 14.6172 0.914062C14.8906 1.10547 15.0273 1.43359 14.9727 1.76172Z"
                              fill="currentcolor" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="tp-copyright-area tp-copyright-style-2 black-bg tp-copyright-border tp-copyright-height">
          <div className="container">
            <div className="row">
              <div className="col-12 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".3s">
                <div className="tp-copyright-left text-center">
                  <p> <CopyRight /> </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
};

export default FooterFive;