
'use client'
import project_data from '@/data/project_data';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect } from 'react';

const projects = project_data.filter(item => item.path === 'home_4')

type DataType = {
  subtitle: string;
  title: React.JSX.Element;
  description: string;
}
const project_content: DataType = {
  subtitle: `Latests Project`,
  title: <>Where Form Meets Function <br /> with Flair designer</>,
  description: `Nulla vitae ex nunc. Morbi quis purus convallis, fermentum hioon metus volutpat design sodales purus. Nunc quis an mauris etion eros vulputate mattis Nulla vitae ex nunc.`
}

const { subtitle, title, description } = project_content

const ProjectAreaHomeFour = () => {

  useEffect(() => {
    const handleMouseEnter = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const tpService2Items = document.querySelectorAll('.tp-project-3-item');

      if (target.classList.contains('tp-project-3-item')) {
        target.classList.add('active');

        // Remove 'active' class from all items except the current one
        tpService2Items.forEach(item => {
          if (item !== target) {
            item.classList.remove('active');
          }
        });
      }
    };

    const tpService2Items = document.querySelectorAll('.tp-project-3-item');

    tpService2Items.forEach(item => {
      item.addEventListener('mouseenter', handleMouseEnter as EventListenerOrEventListenerObject);
    });

    return () => {
      tpService2Items.forEach(item => {
        item.removeEventListener('mouseenter', handleMouseEnter as EventListenerOrEventListenerObject);
      });
    };

  }, []);

  return (
    <>
      <div id="project-one-page" className="tp-project-3-area grey-bg pt-140 pb-70">
        <div className="container">
          <div className="tp-project-3-title-wrap mb-60">
            <div className="row align-items-end">
              <div className="col-xl-7 col-lg-7">
                <div className="tp-project-3-title-box">
                  <span className="tp-section-subtitle tp-split-text tp-split-in-right">{subtitle}</span>
                  <h3 className="tp-section-title tp-split-text tp-split-in-right">{title}</h3>
                </div>
              </div>
              <div className="col-xl-5 col-lg-5">
                <div className="tp-project-3-top-text">
                  <p className="mb-0">{description}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row grid-2">
            <div className="grid-sizer"></div>

            {projects.map((item, i) => (
              <div key={i} className={`${i === 3 ? 'col-xl-3' : i === 4 ? 'col-xl-3' : ''} ${i === 3 ? 'col-lg-3' : i === 4 ? 'col-lg-3' : ''} col-md-6 mb-30 grid-item-2`}>
                <div className="tp-project-3-item p-relative">
                  <div className="tp-project-3-thumb">
                    <Image src={item.img} alt="image-here" />
                  </div>
                  <div className="tp-project-3-content">
                    <h5 className="tp-project-3-title">
                      <Link href="/project-details">{item.title}</Link></h5>
                    <span>Lorem Ipsum is simply dummy</span>
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

export default ProjectAreaHomeFour;