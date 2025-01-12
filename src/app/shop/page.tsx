

import React from 'react';
import Wrapper from '@/layouts/Wrapper';
import Shop from '@/components/shop';


export const metadata = {
  title: "Mirror Exhibit Shop - Bespoke laser-engraved mirrors for your home. Elevate your space with custom designs, premium materials, and unparalleled craftsmanship",
};



const index = () => {
  return (
    <Wrapper>
      <Shop />
    </Wrapper>
  );
};

export default index;