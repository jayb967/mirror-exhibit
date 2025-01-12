'use client'

import Link from 'next/link';
import Image from 'next/image';
import NavMenu from './menu/NavMenu';
import React, { useEffect, useState } from 'react';

import logo_1 from "@/assets/img/logo/logo-white.png";
import logo_2 from "@/assets/img/logo/logo-black.png";
import SearchPopup from '@/components/common/SearchPopup';
import Offcanvus from '@/components/common/Offcanvus';
import UseSticky from '@/hooks/UseSticky';
import OnPageMenu from './menu/OnPageMenu';
import OnePageOffcanvas from '@/components/common/OnePageOffcanvas';
import ShoppingCart from '@/components/common/ShoppingCart';


interface DataType {
  onePageHomeTwo?: boolean
}

const HeaderTwo = ({ onePageHomeTwo }: DataType) => {

  // sticky menu
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop: number = window.scrollY || document.documentElement.scrollTop;

      if (currentScrollTop > lastScrollTop) {
        document.querySelector('.tp-int-menu')?.classList.remove('tp-header-pinned');
      } else if (currentScrollTop <= 500) {
        document.querySelector('.tp-int-menu')?.classList.remove('tp-header-pinned');
      } else {
        document.querySelector('.tp-int-menu')?.classList.add('tp-header-pinned');
      }
      setLastScrollTop(currentScrollTop);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollTop]);


  const [showSearch, setShowSearch] = useState(false);
  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const { sticky } = UseSticky()



  return (
    <>
      <header>

        <div id={`${onePageHomeTwo ? 'header-sticky' : ''}`} className={`tp-header-tranparent ${onePageHomeTwo ? 'tp-onepage-header sticky-bg z-index-5' : ''} ${sticky ? 'header-sticky' : ''}`}>
          <div className="tp-header-area tp-header-2-pt">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-xl-2 col-lg-4 col-6">
                  <div className="tp-header-logo">
                    <Link href="/"><Image src={logo_1} alt="image-here" /></Link>
                  </div>
                </div>
                <div className="col-xl-8 d-none d-xl-block">
                  <div className="tp-header-2-menu">
                    <nav className="tp-main-menu-content">
                      {!onePageHomeTwo && <NavMenu style_2={true} />}
                      {onePageHomeTwo && <OnPageMenu onePageHomeTwo={onePageHomeTwo} />}
                    </nav>
                  </div>
                </div>
                <div className="col-xl-2 col-lg-8 col-6">
                  <div className="tp-header-2-right text-end">

                    <ul>
                      <li>
                        <div className="tp-header-2-icon cart d-none d-md-block">
                          <Link className="cart-icon" href="/cart">
                            <svg width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19.875 6.63605H17.1677L13.2333 0.73397C13.1184 0.56158 12.9397 0.441904 12.7365 0.401271C12.5334 0.360638 12.3224 0.402376 12.15 0.517303C11.9776 0.632231 11.8579 0.810933 11.8173 1.0141C11.7767 1.21726 11.8184 1.42825 11.9333 1.60064L15.2906 6.63605H5.70937L9.06667 1.60064C9.12492 1.51531 9.16567 1.41927 9.18655 1.31808C9.20744 1.2169 9.20805 1.11258 9.18834 1.01115C9.16864 0.909733 9.12901 0.813227 9.07176 0.727224C9.0145 0.64122 8.94076 0.567428 8.85479 0.510117C8.76882 0.452807 8.67235 0.413116 8.57094 0.393345C8.46953 0.373573 8.3652 0.374113 8.26401 0.394932C8.16281 0.415751 8.06674 0.456436 7.98137 0.514632C7.89601 0.572828 7.82303 0.64738 7.76667 0.73397L3.83229 6.63605H1.125C0.9178 6.63605 0.719086 6.71836 0.572573 6.86488C0.42606 7.01139 0.34375 7.2101 0.34375 7.4173C0.34375 7.6245 0.42606 7.82322 0.572573 7.96973C0.719086 8.11624 0.9178 8.19855 1.125 8.19855H1.52604L3.14896 16.3121C3.28006 16.961 3.63129 17.5446 4.14322 17.9643C4.65516 18.384 5.29636 18.6139 5.95833 18.6152H15.0427C16.4042 18.6152 17.5844 17.6465 17.8521 16.3121L19.475 8.19855H19.876C20.0832 8.19855 20.282 8.11624 20.4285 7.96973C20.575 7.82322 20.6573 7.6245 20.6573 7.4173C20.6573 7.2101 20.575 7.01139 20.4285 6.86488C20.282 6.71836 20.0822 6.63605 19.875 6.63605ZM16.3187 16.0058C16.259 16.3007 16.0993 16.5659 15.8666 16.7567C15.6339 16.9474 15.3425 17.052 15.0417 17.0527H5.95833C5.65746 17.052 5.36607 16.9474 5.13338 16.7567C4.9007 16.5659 4.74099 16.3007 4.68125 16.0058L3.11979 8.19855H17.8802L16.3187 16.0058ZM11.8021 13.6673V11.584C11.8021 11.3768 11.8844 11.1781 12.0309 11.0315C12.1774 10.885 12.3761 10.8027 12.5833 10.8027C12.7905 10.8027 12.9892 10.885 13.1358 11.0315C13.2823 11.1781 13.3646 11.3768 13.3646 11.584V13.6673C13.3646 13.8745 13.2823 14.0732 13.1358 14.2197C12.9892 14.3662 12.7905 14.4486 12.5833 14.4486C12.3761 14.4486 12.1774 14.3662 12.0309 14.2197C11.8844 14.0732 11.8021 13.8745 11.8021 13.6673ZM7.63542 13.6673V11.584C7.63542 11.3768 7.71773 11.1781 7.86424 11.0315C8.01075 10.885 8.20947 10.8027 8.41667 10.8027C8.62387 10.8027 8.82258 10.885 8.96909 11.0315C9.11561 11.1781 9.19792 11.3768 9.19792 11.584V13.6673C9.19792 13.8745 9.11561 14.0732 8.96909 14.2197C8.82258 14.3662 8.62387 14.4486 8.41667 14.4486C8.20947 14.4486 8.01075 14.3662 7.86424 14.2197C7.71773 14.0732 7.63542 13.8745 7.63542 13.6673Z" fill="currentcolor" />
                            </svg>
                          </Link>

                          <ShoppingCart />

                        </div>

                      </li>
                      <li>
                        <div className="tp-header-2-icon d-none d-md-block">
                          <button className="search-open-btn" onClick={() => setShowSearch(!showSearch)}>
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 21.029L16.1511 15.18C17.5384 13.5702 18.3782 11.476 18.3782 9.18912C18.3782 4.12223 14.256 0 9.18912 0C4.12222 0 0 4.12223 0 9.18912C0 14.256 4.12222 18.3782 9.18912 18.3782C11.476 18.3782 13.5702 17.5384 15.18 16.1511L21.029 22L22 21.029ZM1.37327 9.18912C1.37327 4.87944 4.87944 1.37327 9.18912 1.37327C13.4988 1.37327 17.005 4.87944 17.005 9.18912C17.005 13.4988 13.4988 17.005 9.18912 17.005C4.87944 17.005 1.37327 13.4988 1.37327 9.18912Z" fill="currentcolor" />
                            </svg>
                          </button>
                        </div>
                      </li>
                      <li>
                        <div className="tp-header-2-bar">
                          <button className="tp-menu-bar" onClick={() => setShowOffCanvas(!showOffCanvas)}>
                            <svg width="25" height="19" viewBox="0 0 25 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6.25 2C6.25 1.30967 6.80967 0.75 7.5 0.75H23.75C24.4403 0.75 25 1.30967 25 2C25 2.69033 24.4403 3.25 23.75 3.25H7.5C6.80967 3.25 6.25 2.69028 6.25 2ZM23.75 8.25H1.25C0.559668 8.25 0 8.80972 0 9.5C0 10.1903 0.559668 10.75 1.25 10.75H23.75C24.4403 10.75 25 10.1903 25 9.5C25 8.80972 24.4403 8.25 23.75 8.25ZM23.75 15.75H12.5C11.8097 15.75 11.25 16.3097 11.25 17C11.25 17.6903 11.8097 18.25 12.5 18.25H23.75C24.4403 18.25 25 17.6903 25 17C25 16.3097 24.4403 15.75 23.75 15.75Z" fill="currentcolor" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    </ul>


                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!onePageHomeTwo &&
          <div className="tp-header-tranparent">
            <div className="tp-header-2-area tp-header-2-pt tp-int-menu tp-header-sticky-cloned">
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-xl-2 col-lg-4 col-6">
                    <div className="tp-header-logo">
                      <Link href="/"><Image src={logo_2} alt="image-here" /></Link>
                    </div>
                  </div>
                  <div className="col-xl-8 d-none d-xl-block">
                    <div className="tp-header-2-menu">
                      <nav className="tp-main-menu-content">
                        <NavMenu />
                      </nav>
                    </div>
                  </div>
                  <div className="col-xl-2 col-lg-8 col-6">
                    <div className="tp-header-2-right text-end">
                      <ul>
                        <li>
                          <div className="tp-header-2-icon cart d-none d-md-block">
                            <Link className="cart-icon" href="/cart">
                              <svg width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.875 6.63605H17.1677L13.2333 0.73397C13.1184 0.56158 12.9397 0.441904 12.7365 0.401271C12.5334 0.360638 12.3224 0.402376 12.15 0.517303C11.9776 0.632231 11.8579 0.810933 11.8173 1.0141C11.7767 1.21726 11.8184 1.42825 11.9333 1.60064L15.2906 6.63605H5.70937L9.06667 1.60064C9.12492 1.51531 9.16567 1.41927 9.18655 1.31808C9.20744 1.2169 9.20805 1.11258 9.18834 1.01115C9.16864 0.909733 9.12901 0.813227 9.07176 0.727224C9.0145 0.64122 8.94076 0.567428 8.85479 0.510117C8.76882 0.452807 8.67235 0.413116 8.57094 0.393345C8.46953 0.373573 8.3652 0.374113 8.26401 0.394932C8.16281 0.415751 8.06674 0.456436 7.98137 0.514632C7.89601 0.572828 7.82303 0.64738 7.76667 0.73397L3.83229 6.63605H1.125C0.9178 6.63605 0.719086 6.71836 0.572573 6.86488C0.42606 7.01139 0.34375 7.2101 0.34375 7.4173C0.34375 7.6245 0.42606 7.82322 0.572573 7.96973C0.719086 8.11624 0.9178 8.19855 1.125 8.19855H1.52604L3.14896 16.3121C3.28006 16.961 3.63129 17.5446 4.14322 17.9643C4.65516 18.384 5.29636 18.6139 5.95833 18.6152H15.0427C16.4042 18.6152 17.5844 17.6465 17.8521 16.3121L19.475 8.19855H19.876C20.0832 8.19855 20.282 8.11624 20.4285 7.96973C20.575 7.82322 20.6573 7.6245 20.6573 7.4173C20.6573 7.2101 20.575 7.01139 20.4285 6.86488C20.282 6.71836 20.0822 6.63605 19.875 6.63605ZM16.3187 16.0058C16.259 16.3007 16.0993 16.5659 15.8666 16.7567C15.6339 16.9474 15.3425 17.052 15.0417 17.0527H5.95833C5.65746 17.052 5.36607 16.9474 5.13338 16.7567C4.9007 16.5659 4.74099 16.3007 4.68125 16.0058L3.11979 8.19855H17.8802L16.3187 16.0058ZM11.8021 13.6673V11.584C11.8021 11.3768 11.8844 11.1781 12.0309 11.0315C12.1774 10.885 12.3761 10.8027 12.5833 10.8027C12.7905 10.8027 12.9892 10.885 13.1358 11.0315C13.2823 11.1781 13.3646 11.3768 13.3646 11.584V13.6673C13.3646 13.8745 13.2823 14.0732 13.1358 14.2197C12.9892 14.3662 12.7905 14.4486 12.5833 14.4486C12.3761 14.4486 12.1774 14.3662 12.0309 14.2197C11.8844 14.0732 11.8021 13.8745 11.8021 13.6673ZM7.63542 13.6673V11.584C7.63542 11.3768 7.71773 11.1781 7.86424 11.0315C8.01075 10.885 8.20947 10.8027 8.41667 10.8027C8.62387 10.8027 8.82258 10.885 8.96909 11.0315C9.11561 11.1781 9.19792 11.3768 9.19792 11.584V13.6673C9.19792 13.8745 9.11561 14.0732 8.96909 14.2197C8.82258 14.3662 8.62387 14.4486 8.41667 14.4486C8.20947 14.4486 8.01075 14.3662 7.86424 14.2197C7.71773 14.0732 7.63542 13.8745 7.63542 13.6673Z" fill="currentcolor" />
                              </svg>
                            </Link>

                            <ShoppingCart />


                          </div>
                        </li>
                        <li>
                          <div className="tp-header-2-icon d-none d-md-block">
                            <button className="search-open-btn" onClick={() => setShowSearch(!showSearch)}>
                              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 21.029L16.1511 15.18C17.5384 13.5702 18.3782 11.476 18.3782 9.18912C18.3782 4.12223 14.256 0 9.18912 0C4.12222 0 0 4.12223 0 9.18912C0 14.256 4.12222 18.3782 9.18912 18.3782C11.476 18.3782 13.5702 17.5384 15.18 16.1511L21.029 22L22 21.029ZM1.37327 9.18912C1.37327 4.87944 4.87944 1.37327 9.18912 1.37327C13.4988 1.37327 17.005 4.87944 17.005 9.18912C17.005 13.4988 13.4988 17.005 9.18912 17.005C4.87944 17.005 1.37327 13.4988 1.37327 9.18912Z" fill="currentcolor" />
                              </svg>
                            </button>
                          </div>
                        </li>
                        <li>
                          <div className="tp-header-2-bar">
                            <button className="tp-menu-bar" onClick={() => setShowOffCanvas(!showOffCanvas)}>
                              <svg width="25" height="19" viewBox="0 0 25 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.25 2C6.25 1.30967 6.80967 0.75 7.5 0.75H23.75C24.4403 0.75 25 1.30967 25 2C25 2.69033 24.4403 3.25 23.75 3.25H7.5C6.80967 3.25 6.25 2.69028 6.25 2ZM23.75 8.25H1.25C0.559668 8.25 0 8.80972 0 9.5C0 10.1903 0.559668 10.75 1.25 10.75H23.75C24.4403 10.75 25 10.1903 25 9.5C25 8.80972 24.4403 8.25 23.75 8.25ZM23.75 15.75H12.5C11.8097 15.75 11.25 16.3097 11.25 17C11.25 17.6903 11.8097 18.25 12.5 18.25H23.75C24.4403 18.25 25 17.6903 25 17C25 16.3097 24.4403 15.75 23.75 15.75Z" fill="currentcolor" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

      </header>

      <SearchPopup showSearch={showSearch} setShowSearch={setShowSearch} />
      {!onePageHomeTwo && <Offcanvus showOffCanvas={showOffCanvas} setShowOffCanvas={setShowOffCanvas} />}
      {onePageHomeTwo && <OnePageOffcanvas showOffCanvas={showOffCanvas} setShowOffCanvas={setShowOffCanvas} onePageHomeTwo={onePageHomeTwo} />}


    </>
  );
};

export default HeaderTwo;