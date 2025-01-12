
import Checkout from '@/components/checkout';
import Wrapper from '@/layouts/Wrapper';
import React from 'react';


export const metadata = {
  title: "Mirror Exhibit Checkout - Bespoke laser-engraved mirrors for your home. Elevate your space with custom designs, premium materials, and unparalleled craftsmanship",
};

const index = () => {
  return (
    <Wrapper>
      <Checkout />
    </Wrapper>
  );
};

export default index;