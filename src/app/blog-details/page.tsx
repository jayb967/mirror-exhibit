

import React from 'react';
import Wrapper from '@/layouts/Wrapper';
import BlogDetails from '@/components/blog-details';


export const metadata = {
  title: "Mirror Exhibit Blog Details",
};


const index = () => {
  return (
    <Wrapper>
      <BlogDetails />
    </Wrapper>
  );
};

export default index;