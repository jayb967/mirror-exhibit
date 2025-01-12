
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
            <button className="close-btn"><i className="fal fa-times"></i></button>
          </div>
          <div className="tpoffcanvas__logo">
            <Link href="/">
              <Image src={logo_white} alt="image-here" />
            </Link>
          </div>
          <div className="tpoffcanvas__title">
            <p>Luxury mirrors that reflect your style. Handcrafted with precision and care.</p>
          </div>

          <div className="tp-main-menu-mobile d-xl-none">
            <nav className="tp-main-menu-content">
              <MobileMenu />
            </nav>
          </div>
          <div className="tpoffcanvas__contact-info">
            <div className="tpoffcanvas__contact-title">

              <h5>Contact us</h5>

            </div>
            <ul>
              <li>
                <i className="fa-light fa-location-dot"></i>
                <a href="https://www.google.com/maps/@34.0200374,-118.7420549,10z" target="_blank">Los Angeles, CA</a>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:solaredge@gmail.com">info@mirrorexhibit.com</a>
              </li>
              <li>
                <i className="fal fa-phone-alt"></i>
                <a href="tel:+48555223224">+48 555 223 224</a>
              </li>
            </ul>
          </div>
          <div className="tpoffcanvas__input">
            <div className="tpoffcanvas__input-title">
              <h4>Get UPdate</h4>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="p-relative">
                <input type="text" placeholder="Enter mail" />
                <button>
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>
          <div className="tpoffcanvas__social">
            <div className="social-icon">
              <a target='_blank' href="https://twitter.com"><i className="fab fa-twitter"></i></a>
              <a target='_blank' href="https://instagram.com"><i className="fab fa-instagram"></i></a>
              <a target='_blank' href="https://facebook.com"><i className="fab fa-facebook-f"></i></a>
              <a target='_blank' href="https://pinterest.com"><i className="fab fa-pinterest-p"></i></a>
            </div>
          </div>
        </div>
      </div>
      <div className={`body-overlay ${showOffCanvas ? 'apply' : ''}`} onClick={() => setShowOffCanvas(false)}></div>
    </>
  );
};

export default Offcanvus;