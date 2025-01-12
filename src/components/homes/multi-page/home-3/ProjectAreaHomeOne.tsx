
'use client'

import project_data from '@/data/project_data';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

const projects = project_data.filter(item => item.path === 'home_1')

// data
const categories = ["All", ...new Set(projects.map((item) => item.category))];
const perView = 4;


const ProjectAreaHomeOne = () => {

  const [activeCategory, setActiveCategory] = useState("All");
  const [items, setItems] = useState(projects);
	const [next, setNext] = useState(perView);


  const filterItems = (cateItem: string) => {
    setActiveCategory(cateItem);
    setNext(perView);
    if (cateItem === "All") {
      return setItems(projects);
    } else {
      const findItems = projects.filter((findItem) => {
        return findItem.category == cateItem;
      });
      setItems(findItems);
    }
  };



  return (
    <>
      <div id="project-one-page" className="tp-project-area tp-project-style-2 fix">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-project-title-box text-center mb-30">
                <span className="tp-section-subtitle tp-split-text tp-split-in-right">Latests Project</span>
                <h3 className="tp-section-title tp-split-text tp-split-in-right">Where Form Meets Function <br /> with Flair designer</h3>
              </div>
            </div>
            <div className="col-xl-12">
              <div className="tp-project-filter masonary-menu text-center pb-60">
                {categories.map((cate, i) => (
                  <React.Fragment key={i}>
                    <button onClick={() => filterItems(cate)} className={`${cate === activeCategory ? 'active' : ''}`}>
                      {cate}
                    </button>  {' '}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          <div className="row gx-80 grid">
            {items.slice(0, next).map((item, i) => (
              <div className="col-lg-6 col-md-6 grid-item" key={i}>
                <div className="tp-project-item-wrap p-relative">
                  <div className="tp-project-item fix">
                    <div className="tp-project-thumb">
                      <Link href="/project-details">
                        <Image className="w-100" src={item.img} alt="image-here" />
                      </Link>
                    </div>
                  </div>
                  <div className="tp-project-content black-bg">
                    <h6 className="tp-project-title">
                      <Link href="/project-details">{item.title}</Link></h6>
                    <Link className="tp-btn-border-lg white-border" href="/project-details">
                      <span>Read More </span>
                    </Link>
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

export default ProjectAreaHomeOne;