

import React from 'react';
import Image from 'next/image';
import logo from "@/assets/img/logo/logo-white.png";
import SocialLinks, { CopyRight } from '@/components/common/SocialLinks';
import Link from 'next/link';


const footer_content = {
  description: `Luxury mirrors that reflect your style. Handcrafted with precision and care.`,
  link_title: `Our Links`,
  links: [
    // { title: 'Dribble', link: 'https://dribble.com' },
    // { title: 'Linkedin', link: 'https://linkedin.com' },
    { title: 'Facebook', link: 'https://facebook.com' },
    // { title: 'Behance', link: 'https://behance.com' },
  ],
  page_title: 'Pages',
  pages: [
    { title: 'About Us', link: '/about-us' },
    // { title: 'Our Team', link: '/team' },
    // { title: 'Recent News', link: '/blog' },
    { title: 'Gallery Lists', link: '#' },
  ],
  info_title: `Office Information`,
  address: <>Thornridge Cir. <br /> Shiloh 81063</>,
  phone: '(201) 555-0124',
  email: 'info@mirrorexhibit.com',
  our_policy: [
    { title: 'Terms & Conditions', link: '#' },
    { title: 'Privacy Policy', link: '#' },
    // { title: 'Sitemap', link: '#' },

  ]

}

const {
  description,
  link_title,
  links,
  page_title,
  pages,
  info_title,
  address,
  phone,
  email,
  our_policy
} = footer_content




const FooterThree = () => {
  return (
    <>
      <footer>

        <div className="tp-footer-area tp-footer-style-2 tp-footer-style-3 black-bg pt-75 pb-50">
          <div className="container">
            <div className="row">
              <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".3s">
                <div className="tp-footer-widget footer-cols-3-1">
                  <div className="tp-footer-logo">
                    <Link href="/">
                      <Image src={logo} alt="logo-here" />
                    </Link>
                  </div>
                  <div className="tp-footer-text pb-5">
                    <p>{description}</p>
                  </div>
                  <div className="tp-footer-social">
                    {/* <SocialLinks /> */}
                  </div>
                </div>
              </div>
              {/* <div className="col-xl-3 col-lg-2 col-md-6 col-sm-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".5s">
                <div className="tp-footer-widget footer-cols-3-2">
                  <h4 className="tp-footer-title">{link_title}</h4>
                  <div className="tp-footer-list">
                    <ul>
                      {links.map((link, i) => (
                        <li key={i}><a href={link.link}>{link.title}</a></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div> */}
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".7s">
                <div className="tp-footer-widget footer-cols-3-3">
                  <h4 className="tp-footer-title">{page_title}</h4>
                  <div className="tp-footer-list">
                    <ul>
                      {pages.map((page, i) => (
                        <li key={i}><a href={page.link}>{page.title}</a></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6 mb-50 wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".9s">
                <div className="tp-footer-widget d-flex justify-content-lg-end footer-cols-3-4">
                  <div className="tp-footer-contact-box">
                    <h4 className="tp-footer-title">{info_title}</h4>
                    <div className="tp-footer-contact">
                      <ul>
                        {/* <li>
                          <a
                            href="https://www.google.com/maps/place/United+States/@21.2541411,-83.1622716,7.17z/data=!4m6!3m5!1s0x54eab584e432360b:0x1c3bb99243deb742!8m2!3d37.09024!4d-95.712891!16zL20vMDljN3cw?entry=ttu">1901
                            {address}
                          </a>
                        </li> */}
                        <li>
                          <a href={`tel:${phone}`}>{phone}</a>
                        </li>
                        <li>
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

        <div className="tp-copyright-area tp-copyright-style-2 black-bg tp-copyright-border tp-copyright-height">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".3s">
                <div className="tp-copyright-left tp-copyright-left-pt text-center text-lg-start">
                  <p> <CopyRight /> </p>
                </div>
              </div>
              <div className="col-lg-6  wow tpfadeUp" data-wow-duration=".9s" data-wow-delay=".5s">
                <div className="tp-copyright-right text-center text-lg-end">
                  {our_policy.map((item, i) => (
                    <a key={i} href={item.link}>{item.title}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </footer>

    </>
  );
};

export default FooterThree;