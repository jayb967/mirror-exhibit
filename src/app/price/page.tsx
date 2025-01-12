
import React from 'react';
import Price from '@/components/price';
import Wrapper from '@/layouts/Wrapper';

export const metadata = {
  title: "Mirror Exhibit Price - Bespoke laser-engraved mirrors for your home. Elevate your space with custom designs, premium materials, and unparalleled craftsmanship",
};


const index = () => {
  return (
    <Wrapper>
      <Price />
    </Wrapper>
  );
};

export default index;