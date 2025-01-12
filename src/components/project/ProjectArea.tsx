
'use client'

import project_data from '@/data/project_data';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

const projects = project_data.filter(item => item.path === 'project')

// data
const categories = ["All", ...new Set(projects.map((item) => item.category))];
const perView = 6;


const ProjectArea = () => {


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
      <div className="tp-project-4-area pt-150 pb-90 fix">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-project-title-box text-center mb-30">
                <span className="tp-section-subtitle">Latests Project</span>
                <h3 className="tp-section-title">Where Form Meets Function <br /> with Flair designer</h3>
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
          <div className="row grid gx-35">
            {items.slice(0, next).map((item, i) => (
              <div key={i} className="col-lg-4 col-md-6 grid-item cat5 cat3 cat2">
                <div className="tp-project-4-item p-relative">
                  <div className="tp-project-4-thumb">
                    <Image src={item.img} alt="image-here" />
                  </div>
                  <div className="tp-project-4-content">
                    <h6 className="tp-project-4-title"><Link href="/project-details">{item.title}</Link></h6>
                    <p>{item.description}</p>
                    <Link className="tp-btn-border-lg white-border" href="/project-details">
                      <span>Read More</span>
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

export default ProjectArea;