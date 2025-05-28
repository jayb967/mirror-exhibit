'use client'

import Link from 'next/link';
import Image from 'next/image';
import NavMenu from './menu/NavMenu';
import React, { useEffect, useState } from 'react';

import white_logo from "@/assets/img/logo/logo-white.png";
import black_logo from "@/assets/img/logo/logo-black.png";
import Offcanvus from '@/components/common/Offcanvus';
import UseSticky from '@/hooks/UseSticky';
import CartButtonComponent from '@/components/common/CartButtonComponent';
import ProfileButtonComponent from '@/components/common/ProfileButtonComponent';

const ProductHeader = () => {
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

  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const { sticky } = UseSticky()

  return (
    <>
      {/* Initial header with dark background */}
      <div className="tp-header-area tp-header-tranparent tp-header-style-4 tp-header-style-5 header-sticky" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div className="container custom-container-3">
          <div className="row align-items-center">
            <div className="col-xl-2 col-lg-4 col-6">
              <div style={{marginLeft: 30}} className="tp-header-logo">
                <Link href="/"><Image style={{height: 'auto'}} src={white_logo} alt="Mirror Exhibit" /></Link>
              </div>
            </div>
            <div className="col-xl-8 d-none d-xl-block">
              <div className="tp-header-menu">
                <nav className="tp-main-menu-content">
                  <NavMenu />
                </nav>
              </div>
            </div>
            <div className="col-xl-2 col-lg-8 col-6">
              <div className="tp-header-right d-flex align-items-center justify-content-end">
                <div style={{ marginRight: '15px' }}>
                  <ProfileButtonComponent iconColor="#fff" />
                </div>
                <CartButtonComponent
                  variant="navbar"
                  iconColor="#fff"
                />
                <div className="tp-header-bar" >
                  <button className="tp-menu-bar" style={{ marginTop: '5px' }} onClick={() => setShowOffCanvas(!showOffCanvas)}>
                    ☰
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky header that appears on scroll */}
      <div className="tp-header-area tp-header-tranparent tp-header-style-4 tp-header-style-5 tp-int-menu tp-header-sticky-cloned">
        <div className="container custom-container-3">
          <div className="row align-items-center">
            <div className="col-xl-2 col-lg-4 col-6">
              <div style={{marginLeft: 30}} className="tp-header-logo">
                <Link href="/"><Image style={{height: 'auto'}} src={black_logo} alt="Mirror Exhibit" /></Link>
              </div>
            </div>
            <div className="col-xl-8 d-none d-xl-block">
              <div className="tp-header-menu">
                <nav className="tp-main-menu-content">
                  <NavMenu />
                </nav>
              </div>
            </div>
            <div className="col-xl-2 col-lg-8 col-6">
              <div className="tp-header-right d-flex align-items-center justify-content-end">
                <div style={{ marginRight: '15px' }}>
                  <ProfileButtonComponent iconColor="#000" />
                </div>
                <CartButtonComponent
                  variant="navbar"
                  iconColor="#000"
                />
                <div className="tp-header-bar">
                  <button className="tp-menu-bar" onClick={() => setShowOffCanvas(!showOffCanvas)}>
                    ☰
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Offcanvus showOffCanvas={showOffCanvas} setShowOffCanvas={setShowOffCanvas} />
    </>
  );
};

export default ProductHeader;
