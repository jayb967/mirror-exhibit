'use client';

import React from 'react';
import HeaderFive from './headers/HeaderFive';
import FooterThree from './footers/FooterThree';
import FloatingCartButton from '@/components/common/FloatingCartButton';

interface DefaultLayoutProps {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            {children}
          </main>
          <FooterThree />
        </div>
      </div>
      <FloatingCartButton />
    </>
  );
};

export default DefaultLayout;
