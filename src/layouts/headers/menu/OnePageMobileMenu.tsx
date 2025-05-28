"use client"
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import React, { useState } from "react";
// internal
import ScrollspyNav from "react-scrollspy-nav";
import CartButtonComponent from "@/components/common/CartButtonComponent";

import demo_img_1 from "@/assets/img/menu/home-1.jpg";
import demo_img_2 from "@/assets/img/menu/home-2.jpg";
import demo_img_3 from "@/assets/img/menu/home-3.jpg";
import demo_img_4 from "@/assets/img/menu/home-4.jpg";
import demo_img_5 from "@/assets/img/menu/home-5.jpg";

interface DataType {
  id: number;
  title: string;
  link: string;
  img_dropdown: boolean;
  sub_menus: {
    link: string;
    title: string;
    one_page_link: string;
    demo_img: StaticImageData;
  }[];
}[]
const on_page_menu_data: DataType[] = [
  {
    id: 1,
    title: "Home",
    link: "#",
    img_dropdown: true,
    sub_menus: [
      { link: "/", title: "Home 01", one_page_link: "/home-1-one-page", demo_img: demo_img_1, },
      { link: "/home-2", title: "Home 02", one_page_link: "/home-2-one-page", demo_img: demo_img_2, },
      { link: "/home-3", title: "Home 03", one_page_link: "/home-3-one-page", demo_img: demo_img_3, },
      { link: "/home-4", title: "Home 04", one_page_link: "/home-4-one-page", demo_img: demo_img_4, },
      { link: "/home-5", title: "Home 05", one_page_link: "/home-5-one-page", demo_img: demo_img_5, },
    ],
  },
]




const OnePageMobileMenu = ({ onePageHomeOne, onePageHomeTwo, onePageHomeThree, onePageHomeFour, onePageHomeFive }: any) => {
  const [navTitle, setNavTitle] = useState("");
  //openMobileMenu
  const openMobileMenu = (menu: string) => {
    if (navTitle === menu) {
      setNavTitle("");
    } else {
      setNavTitle(menu);
    }
  };

  return (
    <>
      <ul>
        {on_page_menu_data.map((menu, i) => (
          <React.Fragment key={i}>
            {menu.img_dropdown &&
              <li className="has-dropdown-2">
                <Link href={menu.link}>{menu.title}
                  <button className={`dropdown-toggle-btn ${navTitle === menu.title ? "dropdown-opened" : ""}`}
                    onClick={() => openMobileMenu(menu.title)}
                    style={{ fontSize: "18px", cursor: "pointer" }}>
                    ▶
                  </button>
                </Link>
                <div className="tp-submenu has-homemenu" style={{ display: navTitle === menu.title ? "block" : "none" }}>
                  <div className="row gx-6 row-cols-1 row-cols-md-2 row-cols-xl-5">
                    {menu.sub_menus?.map((sub_menu, index) =>
                      <div key={index} className="col homemenu">
                        <div className="homemenu-thumb mb-15">
                          <Image src={sub_menu.demo_img} alt="image-here" />
                          <div className="homemenu-btn">
                            <Link className="tp-menu-btn" href={sub_menu.link}>Multi Page</Link>
                            <Link className="tp-menu-btn" href={sub_menu.one_page_link}>One Page</Link>
                          </div>
                        </div>
                        <div className="homemenu-content text-center">
                          <h4 className="homemenu-title">
                            <Link href={sub_menu.link}><span>{sub_menu.title}</span></Link>
                          </h4>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            }
          </React.Fragment>
        ))}
        {onePageHomeOne &&
          <ScrollspyNav
            scrollTargetIds={["Service", "About", "Project", "Product", "Blog", "Contact",]}
            offset={10}
            scrollDuration="1000"
            headerBackground="true">

            <li><a href="#service-one-page">Services</a></li>
            <li><a href="#about-one-page">About Us </a></li>
            <li> <a href="#project-one-page">Projects</a></li>
            <li><a href="#product-one-page">Product</a></li>
            <li><a href="#blog-one-page">Blog</a> </li>
            <li><a href="#contact-one-page">Contact</a></li>

          </ScrollspyNav>
        }
        {onePageHomeTwo &&
          <ScrollspyNav
            scrollTargetIds={["Service", "About", "Project", "Testimonial", "Team", "Product",]}
            offset={10}
            scrollDuration="1000"
            headerBackground="true">
            <li><a href="#service-one-page">Service</a></li>
            <li><a href="#about-one-page">About us</a></li>
            <li> <a href="#project-one-page">Projects</a></li>
            <li><a href="#testimonial-one-page">Testimonial</a></li>
            <li><a href="#team-one-page">Team</a> </li>
            <li><a href="#product-one-page">Product</a></li>

          </ScrollspyNav>
        }


        {onePageHomeThree &&
          <ScrollspyNav
            scrollTargetIds={["Service", "About", "Gallery", "Team", "Product", "Blog"]}
            offset={10}
            scrollDuration="1000"
            headerBackground="true">
            <li><a href="#service-one-page">Services</a></li>
            <li><a href="#about-one-page">About Us </a></li>
            <li> <a href="#gallery-one-page">Gallery</a></li>
            <li><a href="#team-one-page">Team</a></li>
            <li><a href="#product-one-page">Product</a></li>
            <li><a href="#blog-one-page">Blog</a> </li>

          </ScrollspyNav>
        }

        {onePageHomeFour &&
          <ScrollspyNav
            scrollTargetIds={["About", "Service", "Project", "Team", "Product", "Blog"]}
            offset={10}
            scrollDuration="1000"
            headerBackground="true">

            <li><a href="#about-one-page">About Us </a></li>
            <li><a href="#service-one-page">Services</a></li>
            <li> <a href="#project-one-page">Project</a></li>
            <li><a href="#team-one-page">Team</a></li>
            <li><a href="#product-one-page">Product</a></li>
            <li><a href="#blog-one-page">Blog</a> </li>

          </ScrollspyNav>
        }

        {onePageHomeFive &&
          <ScrollspyNav
            scrollTargetIds={["Service", "About", "Project", "Team", "Progress", "Blog"]}
            offset={10}
            scrollDuration="1000"
            headerBackground="true">

            <li><a style={{ color: "#fff" }} href="#service-one-page">Services</a></li>
            <li><a style={{ color: "#fff" }} href="#about-one-page">About Us </a></li>
            <li><a style={{ color: "#fff" }} href="#project-one-page">Project</a></li>
            <li><a style={{ color: "#fff" }} href="#team-one-page">Team</a></li>
            <li><a style={{ color: "#fff" }} href="#progress-one-page">Progress</a></li>
            <li><a style={{ color: "#fff" }} href="#blog-one-page">Blog</a> </li>

          </ScrollspyNav>
        }


      </ul>

      {/* Mobile Cart Button */}
      <div className="mobile-cart-section" style={{ padding: '20px', borderTop: '1px solid #eee', marginTop: '20px' }}>
        <CartButtonComponent
          variant="navbar"
          iconColor="#000"
          showDropdown={false}
        />
      </div>

    </>
  );
};

export default OnePageMobileMenu;



