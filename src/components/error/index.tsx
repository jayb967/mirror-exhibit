

import React from 'react';
import Image from 'next/image';
import Breadcrumb from '../common/Breadcrumb';
import HeaderFive from '@/layouts/headers/HeaderFive';
import FooterOne from '@/layouts/footers/FooterOne';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';

import error_img from '@/assets/img/error/error.jpg';
import Link from 'next/link';


const Error = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Error Page' subtitle='Error Page' />
            <div className="tp-error-area pt-120 pb-120">
              <div className="container">
                <div className="row">
                  <div className="col-xl-12">
                    <div className="tp-error-content-box text-center">
                      <div className="tp-error-thumb-box pb-75">
                        <Image src={error_img} alt="" />
                      </div>
                      <div className="tp-error-content">
                        <h4 className="tp-error-title">Something went wrong here!</h4>
                        <Link className="tp-btn-black" href="/"><span>BACK TO HOME</span></Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default Error;