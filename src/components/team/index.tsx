

import FooterOne from '@/layouts/footers/FooterOne';
import HeaderFive from '@/layouts/headers/HeaderFive';
import React from 'react';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import Breadcrumb from '../common/Breadcrumb';
import TeamArea from './TeamArea';

const Team = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Team' subtitle='Team' />
            <TeamArea />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default Team;