
'use client'

import Link from 'next/link';
import React from 'react';
import Image from 'next/image';

import logo from '@/assets/img/logo/logo-grey.png';
import { CopyRight } from '@/components/common/SocialLinks';

const footer_content = {
  info: `Mirror Exhibit offers premium quality mirrors and home decor pieces that transform your living spaces with elegance and style.`,
  link_title: `Social Media`,
  links: [
    { title: 'Instagram', link: 'https://instagram.com' },
    { title: 'Pinterest', link: 'https://pinterest.com' },
    { title: 'Facebook', link: 'https://facebook.com' },
  ],
  page_title: 'Shop',
  pages: [
    { title: 'Wall Mirrors', link: '/shop' },
    { title: 'Decorative Mirrors', link: '/shop' },
    { title: 'Bathroom Mirrors', link: '/shop' },
    { title: 'Custom Designs', link: '/shop' },
  ],
  info_title: `Contact Us`,
  address: <>Los Angeles, CA</>,
  // Phone number will be added later
  // phone: '(310) 555-7890',
  email: 'info@mirrorexhibit.com',
}


const { info, link_title, links, page_title, pages, info_title, address, phone, email } = footer_content

const FooterOne = () => {
  return (
    <>
      <footer>
        <div className="tp-footer-area pt-95 pb-50">
          <div className="container">
            <div className="row">
              <div className="col-xl-4 col-lg-3 col-md-6 col-sm-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".3s">
                <div className="tp-footer-widget footer-cols-1">
                  <div className="tp-footer-logo">
                    <Link href="/">
                      <Image src={logo} alt="image-here" />
                    </Link>
                  </div>
                  <div className="tp-footer-text pb-10">
                    <p>{info}</p>
                  </div>
                  <div className="tp-footer-input-box">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input type="email" placeholder="Subscribe to our newsletter" />
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
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-md-6 col-sm-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".5s">
                <div className="tp-footer-widget footer-cols-2">
                  <h4 className="tp-footer-title">{link_title}</h4>
                  <div className="tp-footer-list">
                    <ul>
                      {links.map((link, i) => (
                        <li key={i}>
                          <a target='_blank' href={link.link}>{link.title}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-2 col-md-6 col-sm-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".7s">
                <div className="tp-footer-widget footer-cols-3">
                  <h4 className="tp-footer-title">{page_title}</h4>
                  <div className="tp-footer-list">
                    <ul>
                      {pages.map((page, i) => (
                        <li key={i}><Link href={page.link}>{page.title}</Link></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".9s">
                <div className="tp-footer-widget d-flex justify-content-lg-end footer-cols-4">
                  <div className="tp-footer-contact-box">
                    <h4 className="tp-footer-title">{info_title}</h4>
                    <div className="tp-footer-contact">
                      <ul>
                        <li>
                          <span>
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M13.9727 11.332L13.3164 14.0938C13.2344 14.5039 12.9062 14.7773 12.4961 14.7773C5.60547 14.75 0 9.14453 0 2.25391C0 1.84375 0.246094 1.51562 0.65625 1.43359L3.41797 0.777344C3.80078 0.695312 4.21094 0.914062 4.375 1.26953L5.66016 4.25C5.79688 4.60547 5.71484 5.01562 5.41406 5.23438L3.9375 6.4375C4.86719 8.32422 6.39844 9.85547 8.3125 10.7852L9.51562 9.30859C9.73438 9.03516 10.1445 8.92578 10.5 9.0625L13.4805 10.3477C13.8359 10.5391 14.0547 10.9492 13.9727 11.332Z"
                                fill="currentcolor" />
                            </svg>
                          </span>
                          <a
                            href="https://www.google.com/maps/place/United+States/@21.2541411,-83.1622716,7.17z/data=!4m6!3m5!1s0x54eab584e432360b:0x1c3bb99243deb742!8m2!3d37.09024!4d-95.712891!16zL20vMDljN3cw?entry=ttu">1901
                            {address}
                          </a>
                        </li>
                        {/* Phone number will be added later
                        <li>
                          <span>
                            <svg width="11" height="15" viewBox="0 0 11 15" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M4.59375 14.4219C3.17188 12.6445 0 8.40625 0 6C0 3.10156 2.32422 0.75 5.25 0.75C8.14844 0.75 10.5 3.10156 10.5 6C10.5 8.40625 7.30078 12.6445 5.87891 14.4219C5.55078 14.832 4.92188 14.832 4.59375 14.4219ZM5.25 7.75C6.20703 7.75 7 6.98438 7 6C7 5.04297 6.20703 4.25 5.25 4.25C4.26562 4.25 3.5 5.04297 3.5 6C3.5 6.98438 4.26562 7.75 5.25 7.75Z"
                                fill="currentcolor" />
                            </svg>
                          </span>
                          <a href={`tel:${phone}`}>{phone}</a>
                        </li>
                        */}
                        <li>
                          <span>
                            <svg width="14" height="11" viewBox="0 0 14 11" fill="none"
                              xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M12.6875 0.5C13.3984 0.5 14 1.10156 14 1.8125C14 2.25 13.7812 2.63281 13.4531 2.87891L7.51953 7.33594C7.19141 7.58203 6.78125 7.58203 6.45312 7.33594L0.519531 2.87891C0.191406 2.63281 0 2.25 0 1.8125C0 1.10156 0.574219 0.5 1.3125 0.5H12.6875ZM5.93359 8.04688C6.5625 8.51172 7.41016 8.51172 8.03906 8.04688L14 3.5625V9.25C14 10.2344 13.207 11 12.25 11H1.75C0.765625 11 0 10.2344 0 9.25V3.5625L5.93359 8.04688Z"
                                fill="currentcolor" />
                            </svg>
                          </span>
                          <a href={`mailto:${email}`}>{email}</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        <div className="tp-copyright-area tp-copyright-border tp-copyright-height">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-6 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".3s">
                <div className="tp-copyright-left text-center text-md-start">
                  <p>  <CopyRight /> </p>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".5s">
                <div className="tp-copyright-right text-md-end text-center">
                  <a href="#">Terms & Conditions</a>
                  <a href="#">Shipping Policy</a>
                  <a href="#">Privacy Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>


      </footer>
    </>
  );
};

export default FooterOne;