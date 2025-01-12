

import BlogClassic from '@/components/blog-classic';
import Wrapper from '@/layouts/Wrapper';
import React from 'react';


export const metadata = {
  title: "Mirror Exhibit Blog -",
};


const index = () => {
  return (
    <Wrapper>
      <BlogClassic />
    </Wrapper>
  );
};

export default index;