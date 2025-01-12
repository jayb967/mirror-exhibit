import AboutUs from '@/components/about-us';
import Wrapper from '@/layouts/Wrapper';
import React from 'react';


export const metadata = {
  title: "Mirror Exhibit About Us",
};


const index = () => {
  return (
    <Wrapper>
      <AboutUs />
    </Wrapper> 
  );
};

export default index;