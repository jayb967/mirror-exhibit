

import HeaderFive from '@/layouts/headers/HeaderFive';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import TeamDetailsArea from './TeamDetailsArea';
import TeamAreaHomeTwo from '../homes/multi-page/home-2/TeamAreaHomeTwo';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';

const TeamDetails = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Team Details' subtitle='Team Details' />
            <TeamDetailsArea />
            <TeamAreaHomeTwo style_team={true} style_2={false} />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default TeamDetails;