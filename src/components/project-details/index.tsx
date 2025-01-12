

import HeaderFive from '@/layouts/headers/HeaderFive';
import React from 'react';
import Breadcrumb from '../common/Breadcrumb';
import ProjectArea from './ProjectArea';
import ContactAreaHomeOne from '../homes/multi-page/home-3/ContactAreaHomeOne';
import FooterOne from '@/layouts/footers/FooterOne';

const ProjectDetails = () => {
  return (
    <>
      <HeaderFive />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Breadcrumb title='Project Details' subtitle='Project Details' />
            <ProjectArea />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>

    </>
  );
};

export default ProjectDetails;