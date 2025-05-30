'use client'

import Link from 'next/link';
import Image from 'next/image';
import NavMenu from './menu/NavMenu';
import React, { useEffect, useState } from 'react';

import black_logo from "@/assets/img/logo/logo-black.png";
import Offcanvus from '@/components/common/Offcanvus';
import ShoppingCart from '@/components/common/ShoppingCart';
import ProfileButtonComponent from '@/components/common/ProfileButtonComponent';
import { useSelector } from 'react-redux';

const HeaderFive = () => {

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
  const cartItems = useSelector((state: any) => state.cart.cart);
  const itemCount = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);


  return (
    <>
      <header>

        <div className="tp-header-2-area tp-header-inner-style z-index-5">
          <div className="container custom-container-4">
            <div className="row align-items-center">
              <div className="col-xl-2 col-lg-4 col-6">
                <div className="tp-header-logo">
                  <Link href="/"><Image style={{height: 'auto'}} src={black_logo} alt="image-here" /></Link>
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
                <div className="tp-header-right d-flex align-items-center justify-content-end">
                  <ProfileButtonComponent iconColor="#000" variant="mobile" />
                  <div className="tp-header-icon cart d-none d-xl-block">
                    <Link className="cart-icon" href="/cart">
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.75 15.9688C15.2865 15.9688 14.8333 16.1062 14.4479 16.3637C14.0625 16.6213 13.7621 16.9873 13.5847 17.4156C13.4073 17.8439 13.3609 18.3151 13.4513 18.7697C13.5417 19.2244 13.7649 19.642 14.0927 19.9698C14.4205 20.2976 14.8381 20.5208 15.2928 20.6112C15.7474 20.7016 16.2187 20.6552 16.6469 20.4778C17.0752 20.3004 17.4412 20 17.6988 19.6146C17.9563 19.2292 18.0938 18.7761 18.0938 18.3125C18.0931 17.6911 17.846 17.0953 17.4066 16.6559C16.9672 16.2165 16.3714 15.9694 15.75 15.9688ZM15.75 19.0938C15.5955 19.0938 15.4444 19.0479 15.316 18.9621C15.1875 18.8762 15.0874 18.7542 15.0282 18.6115C14.9691 18.4687 14.9536 18.3116 14.9838 18.1601C15.0139 18.0085 15.0883 17.8693 15.1976 17.7601C15.3068 17.6508 15.446 17.5764 15.5976 17.5463C15.7491 17.5161 15.9062 17.5316 16.049 17.5907C16.1917 17.6499 16.3137 17.75 16.3996 17.8785C16.4854 18.0069 16.5313 18.158 16.5313 18.3125C16.531 18.5196 16.4487 18.7182 16.3022 18.8647C16.1557 19.0112 15.9571 19.0935 15.75 19.0938Z" fill="currentcolor" />
                        <path d="M11.7188 15.9688H5.46875C5.26155 15.9688 5.06284 15.8864 4.91632 15.7399C4.76981 15.5934 4.6875 15.3947 4.6875 15.1875C4.6875 14.9803 4.76981 14.7816 4.91632 14.6351C5.06284 14.4886 5.26155 14.4063 5.46875 14.4063H17.9688C18.1536 14.4062 18.3324 14.3406 18.4734 14.2212C18.6144 14.1018 18.7086 13.9362 18.7391 13.7539L20.3016 4.37891C20.3203 4.26698 20.3144 4.15231 20.2843 4.04289C20.2542 3.93347 20.2007 3.83191 20.1274 3.74529C20.054 3.65867 19.9627 3.58905 19.8598 3.5413C19.7568 3.49354 19.6447 3.46878 19.5312 3.46875H7.03125C6.82405 3.46875 6.62534 3.55106 6.47882 3.69757C6.33231 3.84409 6.25 4.0428 6.25 4.25C6.25 4.4572 6.33231 4.65591 6.47882 4.80243C6.62534 4.94894 6.82405 5.03125 7.03125 5.03125H18.6094L17.307 12.8438H7.57266L3.07578 0.850781C3.01992 0.701771 2.9199 0.573371 2.78908 0.482761C2.65826 0.392151 2.50289 0.343651 2.34375 0.34375H0.78125C0.57405 0.34375 0.375336 0.42606 0.228823 0.572573C0.08231 0.719086 0 0.9178 0 1.125C0 1.3322 0.08231 1.53091 0.228823 1.67743C0.375336 1.82394 0.57405 1.90625 0.78125 1.90625H1.80234L5.90391 12.8438H5.46875C4.89959 12.8397 4.34855 13.0437 3.91913 13.4172C3.48971 13.7908 3.21146 14.3083 3.13664 14.8726C3.06182 15.4368 3.19558 16.0089 3.51279 16.4815C3.83 16.9541 4.30884 17.2946 4.85938 17.4391C4.71274 17.7919 4.65445 18.1752 4.68957 18.5557C4.72469 18.9362 4.85215 19.3024 5.0609 19.6225C5.26965 19.9425 5.55336 20.2068 5.88742 20.3923C6.22147 20.5779 6.59576 20.6791 6.97779 20.6871C7.35983 20.6952 7.73805 20.6098 8.07963 20.4386C8.42121 20.2673 8.71581 20.0152 8.93786 19.7042C9.15992 19.3933 9.30271 19.0328 9.35383 18.6541C9.40496 18.2754 9.36288 17.89 9.23125 17.5313H11.7188C11.926 17.5313 12.1247 17.4489 12.2712 17.3024C12.4177 17.1559 12.5 16.9572 12.5 16.75C12.5 16.5428 12.4177 16.3441 12.2712 16.1976C12.1247 16.0511 11.926 15.9688 11.7188 15.9688ZM7.8125 18.3125C7.8125 18.467 7.76668 18.6181 7.68084 18.7465C7.59499 18.875 7.47298 18.9752 7.33022 19.0343C7.18747 19.0934 7.03038 19.1089 6.87884 19.0787C6.72729 19.0486 6.58808 18.9742 6.47882 18.8649C6.36956 18.7557 6.29516 18.6165 6.26501 18.4649C6.23487 18.3134 6.25034 18.1563 6.30947 18.0135C6.3686 17.8708 6.46873 17.7488 6.59721 17.6629C6.72569 17.5771 6.87673 17.5313 7.03125 17.5313C7.23839 17.5315 7.43698 17.6138 7.58345 17.7603C7.72992 17.9068 7.81229 18.1054 7.8125 18.3125Z" fill="currentcolor" />
                      </svg>
                      {itemCount > 0 && (
                        <span>{itemCount}</span>
                      )}
                    </Link>
                    <ShoppingCart />
                  </div>
                  <div className="tp-header-bar">
                    <button
                      className="tp-menu-bar"
                      onClick={() => setShowOffCanvas(!showOffCanvas)}
                      style={{ color: '#B59410' }}
                    >
                      ☰
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="tp-header-2-area tp-header-inner-style z-index-5 tp-int-menu tp-header-sticky-cloned">
          <div className="container custom-container-4">
            <div className="row align-items-center">
              <div className="col-xl-2 col-lg-4 col-6">
                <div className="tp-header-logo">
                  <Link href="/">
                    <Image style={{height: 'auto'}} src={black_logo} alt="image-here" />
                  </Link>
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
                <div className="tp-header-right d-flex align-items-center justify-content-end">
                  <ProfileButtonComponent iconColor="#000" variant="mobile" />
                  <div className="tp-header-icon cart d-none d-xl-block">
                    <Link className="cart-icon" href="/cart">
                      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.75 15.9688C15.2865 15.9688 14.8333 16.1062 14.4479 16.3637C14.0625 16.6213 13.7621 16.9873 13.5847 17.4156C13.4073 17.8439 13.3609 18.3151 13.4513 18.7697C13.5417 19.2244 13.7649 19.642 14.0927 19.9698C14.4205 20.2976 14.8381 20.5208 15.2928 20.6112C15.7474 20.7016 16.2187 20.6552 16.6469 20.4778C17.0752 20.3004 17.4412 20 17.6988 19.6146C17.9563 19.2292 18.0938 18.7761 18.0938 18.3125C18.0931 17.6911 17.846 17.0953 17.4066 16.6559C16.9672 16.2165 16.3714 15.9694 15.75 15.9688ZM15.75 19.0938C15.5955 19.0938 15.4444 19.0479 15.316 18.9621C15.1875 18.8762 15.0874 18.7542 15.0282 18.6115C14.9691 18.4687 14.9536 18.3116 14.9838 18.1601C15.0139 18.0085 15.0883 17.8693 15.1976 17.7601C15.3068 17.6508 15.446 17.5764 15.5976 17.5463C15.7491 17.5161 15.9062 17.5316 16.049 17.5907C16.1917 17.6499 16.3137 17.75 16.3996 17.8785C16.4854 18.0069 16.5313 18.158 16.5313 18.3125C16.531 18.5196 16.4487 18.7182 16.3022 18.8647C16.1557 19.0112 15.9571 19.0935 15.75 19.0938Z" fill="currentcolor" />
                        <path d="M11.7188 15.9688H5.46875C5.26155 15.9688 5.06284 15.8864 4.91632 15.7399C4.76981 15.5934 4.6875 15.3947 4.6875 15.1875C4.6875 14.9803 4.76981 14.7816 4.91632 14.6351C5.06284 14.4886 5.26155 14.4063 5.46875 14.4063H17.9688C18.1536 14.4062 18.3324 14.3406 18.4734 14.2212C18.6144 14.1018 18.7086 13.9362 18.7391 13.7539L20.3016 4.37891C20.3203 4.26698 20.3144 4.15231 20.2843 4.04289C20.2542 3.93347 20.2007 3.83191 20.1274 3.74529C20.054 3.65867 19.9627 3.58905 19.8598 3.5413C19.7568 3.49354 19.6447 3.46878 19.5312 3.46875H7.03125C6.82405 3.46875 6.62534 3.55106 6.47882 3.69757C6.33231 3.84409 6.25 4.0428 6.25 4.25C6.25 4.4572 6.33231 4.65591 6.47882 4.80243C6.62534 4.94894 6.82405 5.03125 7.03125 5.03125H18.6094L17.307 12.8438H7.57266L3.07578 0.850781C3.01992 0.701771 2.9199 0.573371 2.78908 0.482761C2.65826 0.392151 2.50289 0.343651 2.34375 0.34375H0.78125C0.57405 0.34375 0.375336 0.42606 0.228823 0.572573C0.08231 0.719086 0 0.9178 0 1.125C0 1.3322 0.08231 1.53091 0.228823 1.67743C0.375336 1.82394 0.57405 1.90625 0.78125 1.90625H1.80234L5.90391 12.8438H5.46875C4.89959 12.8397 4.34855 13.0437 3.91913 13.4172C3.48971 13.7908 3.21146 14.3083 3.13664 14.8726C3.06182 15.4368 3.19558 16.0089 3.51279 16.4815C3.83 16.9541 4.30884 17.2946 4.85938 17.4391C4.71274 17.7919 4.65445 18.1752 4.68957 18.5557C4.72469 18.9362 4.85215 19.3024 5.0609 19.6225C5.26965 19.9425 5.55336 20.2068 5.88742 20.3923C6.22147 20.5779 6.59576 20.6791 6.97779 20.6871C7.35983 20.6952 7.73805 20.6098 8.07963 20.4386C8.42121 20.2673 8.71581 20.0152 8.93786 19.7042C9.15992 19.3933 9.30271 19.0328 9.35383 18.6541C9.40496 18.2754 9.36288 17.89 9.23125 17.5313H11.7188C11.926 17.5313 12.1247 17.4489 12.2712 17.3024C12.4177 17.1559 12.5 16.9572 12.5 16.75C12.5 16.5428 12.4177 16.3441 12.2712 16.1976C12.1247 16.0511 11.926 15.9688 11.7188 15.9688ZM7.8125 18.3125C7.8125 18.467 7.76668 18.6181 7.68084 18.7465C7.59499 18.875 7.47298 18.9752 7.33022 19.0343C7.18747 19.0934 7.03038 19.1089 6.87884 19.0787C6.72729 19.0486 6.58808 18.9742 6.47882 18.8649C6.36956 18.7557 6.29516 18.6165 6.26501 18.4649C6.23487 18.3134 6.25034 18.1563 6.30947 18.0135C6.3686 17.8708 6.46873 17.7488 6.59721 17.6629C6.72569 17.5771 6.87673 17.5313 7.03125 17.5313C7.23839 17.5315 7.43698 17.6138 7.58345 17.7603C7.72992 17.9068 7.81229 18.1054 7.8125 18.3125Z" fill="currentcolor" />
                      </svg>
                      {itemCount > 0 && (
                        <span>{itemCount}</span>
                      )}
                    </Link>

                    <ShoppingCart />

                  </div>
                  <div className="tp-header-bar">
                    <button
                      className="tp-menu-bar"
                      onClick={() => setShowOffCanvas(!showOffCanvas)}
                      style={{ color: '#B59410' }}
                    >
                      ☰
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </header>

      <Offcanvus showOffCanvas={showOffCanvas} setShowOffCanvas={setShowOffCanvas} />

    </>
  );
};

export default HeaderFive;