

import React from 'react';
import Wrapper from '@/layouts/Wrapper';
import HomeOneSinglePage from '@/components/homes/one-page/home-1-one-page';


export const metadata = {
  title: "Mirror Exhibit - Bespoke laser-engraved mirrors for your home. Elevate your space with custom designs, premium materials, and unparalleled craftsmanship",
};



const index = () => {
  return (
    <Wrapper>
      <HomeOneSinglePage />
    </Wrapper>
  );
};

export default index;