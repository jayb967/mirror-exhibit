
import HomeOne from '@/components/homes/multi-page/home';
import Wrapper from '@/layouts/Wrapper';
import React from 'react';


export const metadata = {
  title: "Mirror Exhibit - Bespoke laser-engraved mirrors for your home. Elevate your space with custom designs, premium materials, and unparalleled craftsmanship",
};

const index = () => {
  return (
    <Wrapper>
      <HomeOne />
    </Wrapper>
  );
};

export default index;