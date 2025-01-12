
'use client'

import HeaderFive from '@/layouts/headers/HeaderFive';
import React, { useState } from 'react';
import Breadcrumb from '../common/Breadcrumb';
import BlogArea from './BlogArea';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';
import VideoPopup from '@/modals/VideoPopup';

const BlogClassic = () => {

  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);


  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Blogs Classic' subtitle='Blogs Classic' />
            <BlogArea  setIsVideoOpen={setIsVideoOpen} />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>


      {/* video modal start */}
      <VideoPopup
        isVideoOpen={isVideoOpen}
        setIsVideoOpen={setIsVideoOpen}
        videoId={"qmGYnJgCW1o"}
      />
      {/* video modal end */}
    </>
  );
};

export default BlogClassic;