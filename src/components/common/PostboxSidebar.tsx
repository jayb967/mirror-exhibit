
'use client'
import Link from 'next/link';
import React from 'react';


import blgo_img_1 from "@/assets/img/blog/details-sm-1-1.jpg";
import blog_img_2 from "@/assets/img/blog/details-sm-1-2.jpg";
import blog_img_3 from "@/assets/img/blog/details-sm-1-3.jpg";
import Image, { StaticImageData } from 'next/image';


interface DataType {
  title: string;
  latest_post: {
      img: StaticImageData;
      date: string;
      title: string;
  }[];
  catagory_title: string;
  categorys: string[];
  tag_title: string;
  tags: string[];
}


const postbox_content: DataType = {
  title: `Our Latest Post`,
  latest_post: [
    {
      img: blgo_img_1,
      date: `November 21`,
      title: `Craft Your Dream Space with Skilled Interior Experts`,
    },
    {
      img: blog_img_2,
      date: `November 23`,
      title: `Reimagine Your Living Space with Modern Interior Concepts`,
    },
    {
      img: blog_img_3,
      date: `November 25`,
      title: `Create Your Own Haven with Expert Interior Guidance`,
    },
  ],
  catagory_title: `Catagories`,
  categorys: [
    `Business`,
    `Digital Agency`,
    `Introductions`,
    `New Technologies`,
    `Parallax Effects`,
    `Web Development`,
  ],
  tag_title: `Tags`,
  tags: [
    `All Project`,
    `Aesthetics`,
    `Functionality`,
    `Interiour`,
    `Start shape`,
    `Starts`,
  ]

}
const {
  title,
  latest_post,
  catagory_title,
  categorys,
  tag_title,
  tags
} = postbox_content


const PostboxSidebar = () => {
  return (
    <>
      <div className="col-xxl-4 col-xl-4 col-lg-4 mb-50">
        <div className="sidebar__wrapper">
          <div className="sidebar__widget sidebar__widget-theme-bg mb-30">
            <div className="sidebar__widget-content">
              <div className="sidebar__search">
                <form onClick={(e) => e.preventDefault()}>
                  <div className="sidebar__search-input-2">
                    <input type="text" placeholder="Search here" />
                    <button type="submit">
                      <i className="far fa-search"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="sidebar__widget mb-30">
            <h3 className="sidebar__widget-title">{title}</h3>
            <div className="sidebar__widget-content">
              <div className="sidebar__post">
                {latest_post.map((item, i) => (
                  <div key={i} className={`rc__post ${i === 2 ? '' : 'mb-25'} d-flex align-items-center`}>
                    <div className="rc__post-thumb mr-20">
                      <Link href="/blog-details">
                        <Image
                          src={item.img}
                          alt="image-here"
                        />
                      </Link>
                    </div>
                    <div className="rc__post-content">
                      <div className="rc__meta">
                        <span>
                          <i className="fa-light fa-clock"></i>
                          {item.date} , {new Date().getFullYear()}
                        </span>
                      </div>
                      <h3 className="rc__post-title">
                        <Link href="/blog-details ">
                          {item.title}
                        </Link>
                      </h3>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
          <div className="sidebar__widget mb-30">
            <h3 className="sidebar__widget-title">{catagory_title}</h3>
            <div className="sidebar__widget-content">
              <ul>
                {categorys.map((item, i) => (
                  <li key={i} className={`${i === 1 ? 'active' : ''}`}>
                    <Link href="/blog-details">
                      {item}
                      <span>
                        <i className="fa-sharp fa-solid fa-arrow-right"></i>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="sidebar__widget mb-30">
            <h3 className="sidebar__widget-title">{tag_title}</h3>
            <div className="sidebar__widget-content">
              <div className="tagcloud">
                {tags.map((item, i) => (
                  <Link key={i} href="/blog-details">
                    {item}
                  </Link>
                ))} 
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostboxSidebar;