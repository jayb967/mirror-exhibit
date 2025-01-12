

import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import BlogDetailsArea from './BlogDetailsArea';
import FooterOne from '@/layouts/footers/FooterOne';
import HeaderFive from '@/layouts/headers/HeaderFive';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';

const BlogDetails = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Blog Details' subtitle='Blog Details' />
            <BlogDetailsArea />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default BlogDetails;