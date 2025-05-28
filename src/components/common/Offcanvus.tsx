
'use client'

import Link from 'next/link';
import React from 'react';
import Image from "next/image";

import logo_white from '@/assets/img/logo/logo-white.png';
import MobileMenu from '@/layouts/headers/menu/MobileMenu';

const Offcanvus = ({ showOffCanvas, setShowOffCanvas }: any) => {
  return (
    <>
      <div className="tpoffcanvas-area">
        <div className={`tpoffcanvas ${showOffCanvas ? 'opened' : ''}`}>
          <div className="tpoffcanvas__close-btn" onClick={() => setShowOffCanvas(false)}>
            <button className="close-btn">×</button>
          </div>
          <div className="tpoffcanvas__logo">
            <Link href="/">
              <Image
                src={logo_white}
                alt="Mirror Exhibit Logo"
                width={140}
                height={50}
                style={{ width: '140px', height: 'auto' }}
              />
            </Link>
          </div>
          <div className="tpoffcanvas__title">
            <p>Mirror Exhibit offers premium quality mirrors and home decor pieces that transform your living spaces with elegance and style.</p>
          </div>

          <div className="tp-main-menu-mobile d-xl-none">
            <nav className="tp-main-menu-content">
              <MobileMenu />
            </nav>
          </div>
          <div className="tpoffcanvas__contact-info">
            <div className="tpoffcanvas__contact-title">

              <h5>Contact Us</h5>

            </div>
            <ul>
              <li>
                📍
                <a href="https://www.google.com/maps/@34.0200374,-118.7420549,10z" target="_blank">Los Angeles, CA</a>
              </li>
              <li>
                ✉️
                <a href="mailto:info@mirrorexhibit.com">info@mirrorexhibit.com</a>
              </li>
              {/* Phone number will be added later
              <li>
                📞
                <a href="tel:+13105557890">(310) 555-7890</a>
              </li>
              */}
            </ul>
          </div>
          <div className="tpoffcanvas__input">
            <div className="tpoffcanvas__input-title">
              <h4>Subscribe to Our Newsletter</h4>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="p-relative">
                <input type="email" placeholder="Enter your email" />
                <button>
                  ✈️
                </button>
              </div>
            </form>
          </div>
          <div className="tpoffcanvas__social">
            <div className="social-icon">
              <a target='_blank' href="https://twitter.com">🐦</a>
              <a target='_blank' href="https://instagram.com">📷</a>
              <a target='_blank' href="https://facebook.com">📘</a>
              <a target='_blank' href="https://pinterest.com">📌</a>
            </div>
          </div>
        </div>
      </div>
      <div className={`body-overlay ${showOffCanvas ? 'apply' : ''}`} onClick={() => setShowOffCanvas(false)}></div>
    </>
  );
};

export default Offcanvus;