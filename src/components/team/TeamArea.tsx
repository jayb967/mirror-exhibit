

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import team_data from '@/data/team_data';

const team_members = team_data.filter(item => item.path === 'team')

const TeamArea = () => {
  return (
    <>
      <div className="tp-team-area tp-team-style-3 tp-team-inner-style pt-140 pb-120">
        <div className="container">
          <div className="row">

            {team_members.map((item, i) => (
              <div key={i} className="col-xl-6 col-lg-4 col-md-6 mb-30">
                <div className="tp-team-item d-flex align-items-center">
                  <div className="tp-team-thumb">
                    <Image src={item.img} alt="image-here" />
                  </div>
                  <div className="tp-team-author-info">
                    <h5 className="tp-team-title">
                      <Link href="/team-details">{item.name}</Link>
                    </h5>
                    <span className="pb-20 d-block">{item.designation}</span>
                    <div className="tp-team-social-box">
                      <a target='_blank' href="https://facebook.com"><i className="fa-brands fa-facebook-f"></i></a>
                      <a target='_blank' href="https://twitter.com"><i className="fa-brands fa-twitter"></i></a>
                      <a target='_blank' href="https://instagram.com"><i className="fa-brands fa-instagram"></i></a>
                      <a target='_blank' href="https://pinterest.com"><i className="fa-brands fa-pinterest-p"></i></a>
                    </div>
                  </div>
                </div>
              </div>
            ))} 

          </div>
        </div>
      </div>
    </>
  );
};

export default TeamArea;