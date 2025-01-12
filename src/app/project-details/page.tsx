

import ProjectDetails from '@/components/project-details';
import Wrapper from '@/layouts/Wrapper';
import React from 'react';


export const metadata = {
  title: "Mirror Exhibit",
};


const index = () => {
  return (
    <Wrapper>
      <ProjectDetails />
    </Wrapper>
  );
};

export default index;