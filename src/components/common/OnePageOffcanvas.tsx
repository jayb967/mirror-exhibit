'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import logo_white from '@/assets/img/logo/logo-white.png';
import OnePageMobileMenu from '@/layouts/headers/menu/OnePageMobileMenu';


const OnePageOffcanvas = ({ showOffCanvas, setShowOffCanvas, onePageHomeOne, onePageHomeTwo, onePageHomeThree, onePageHomeFour, onePageHomeFive }: any) => {


  return (
    <>

      <div className="tpoffcanvas-area">
        <div className={`tpoffcanvas ${showOffCanvas ? 'opened' : ''}`}>
          <div className="tpoffcanvas__close-btn" onClick={() => setShowOffCanvas(false)}>
            <button className="close-btn">×</button>
          </div>
          <div className="tpoffcanvas__logo">
            <Link href="/">
              <Image src={logo_white} alt="image-here" />
            </Link>
          </div>
          <div className="tpoffcanvas__title">
            <p>consectetur orem ipsum dolor sit amet adipisicing elit. Minima incidunt eaque ab cumque, porro maxime
              autem sed.</p>
          </div>

          <div className="tp-main-menu-mobile d-xl-none">
            <nav className="tp-main-menu-content">
              {onePageHomeOne && <OnePageMobileMenu onePageHomeOne={onePageHomeOne} />}
              {onePageHomeTwo && <OnePageMobileMenu onePageHomeTwo={onePageHomeTwo} />}
              {onePageHomeThree && <OnePageMobileMenu onePageHomeThree={onePageHomeThree} />}
              {onePageHomeFour && <OnePageMobileMenu onePageHomeFour={onePageHomeFour} />}
              {onePageHomeFive && <OnePageMobileMenu onePageHomeFive={onePageHomeFive} />}
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
                ✉️
                <a href="mailto:info@mirrorexhibit.com">info@mirrorexhibit.com</a>
              </li>
              <li>
                📞
                <a href="tel:+48555223224">+48 555 223 224</a>
              </li>
            </ul>
          </div>
          <div className="tpoffcanvas__input">
            <div className="tpoffcanvas__input-title">
              <h4>Get Updates</h4>
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="p-relative">
                <input type="text" placeholder="Enter email" />
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

export default OnePageOffcanvas;