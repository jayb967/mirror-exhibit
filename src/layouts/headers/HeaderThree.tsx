
'use client'

import React, { useEffect, useState } from 'react';
import NavMenu from './menu/NavMenu';
import Link from 'next/link';

import logo from "@/assets/img/logo/logo-black.png";
import Image from 'next/image';
import Offcanvus from '@/components/common/Offcanvus';
import OnPageMenu from './menu/OnPageMenu';
import UseSticky from '@/hooks/UseSticky';
import OnePageOffcanvas from '@/components/common/OnePageOffcanvas';
import CartButtonComponent from '@/components/common/CartButtonComponent';
import ShoppingCart from '@/components/common/ShoppingCart';

const HeaderThree = ({ onePageHomeFour }: any) => {

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
      <div
        id={`${onePageHomeFour ? 'header-sticky' : ''}`}
        className={`tp-header-area tp-header-tranparent tp-header-style-4 ${onePageHomeFour ? 'tp-onepage-header' : ''} ${sticky ? 'header-sticky' : ''} `}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-2 col-lg-4 col-6">
              <div className="tp-header-logo">
                <Link href="/"><Image src={logo} alt="image-here" /></Link>
              </div>
            </div>
            <div className="col-xl-8 d-none d-xl-block">
              <div className="tp-header-menu">
                <nav className="tp-main-menu-content">
                  {!onePageHomeFour && <NavMenu />}
                  {onePageHomeFour && <OnPageMenu onePageHomeFour={onePageHomeFour} />}
                </nav>
              </div>
            </div>
            <div className="col-xl-2 col-lg-8 col-6">
              <div className="tp-header-right d-flex align-items-center justify-content-end">
                <CartButtonComponent
                  variant="navbar"
                  iconColor={sticky ? "#000" : "#fff"}
                />
                <div className="tp-header-bar">
                  <button className="tp-menu-bar" style={{ marginTop: '5px' }} onClick={() => setShowOffCanvas(!showOffCanvas)}><i className="fa-solid fa-bars"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!onePageHomeFour &&
        <div className="tp-header-area tp-header-tranparent tp-header-style-4 tp-int-menu tp-header-sticky-cloned">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-xl-2 col-lg-4 col-6">
                <div className="tp-header-logo">
                  <Link href="/"><Image src={logo} alt="image-here" /></Link>
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
                  <div className="tp-header-icon cart d-none d-xl-block">
                    <Link className="cart-icon mr-0 p-relative" href="/cart">
                      <i className="fa-sharp fa-solid fa-cart-shopping shopping-cart"></i>
                      <span>
                        <i className="far fa-plus"></i>
                      </span>
                    </Link>

                    <ShoppingCart />

                  </div>
                  <div className="tp-header-bar">
                    <button className="tp-menu-bar" onClick={() => setShowOffCanvas(!showOffCanvas)}><i className="fa-solid fa-bars"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <Offcanvus showOffCanvas={showOffCanvas} setShowOffCanvas={setShowOffCanvas} />

      {onePageHomeFour && <OnePageOffcanvas showOffCanvas={showOffCanvas} setShowOffCanvas={setShowOffCanvas} onePageHomeFour={onePageHomeFour} />}


    </>
  );
};

export default HeaderThree;