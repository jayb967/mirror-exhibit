import { StaticImageData } from "next/image";

import demo_img_1 from "@/assets/img/menu/home-1.jpg";
import demo_img_2 from "@/assets/img/menu/home-2.jpg";
import demo_img_3 from "@/assets/img/menu/home-3.jpg";
import demo_img_4 from "@/assets/img/menu/home-4.jpg";
import demo_img_5 from "@/assets/img/menu/home-5.jpg";

interface DataType {
  id: number;
  title: string;
  link: string;
  img_dropdown?: boolean;
  has_dropdown?: boolean;
  sub_menus?: {
    link: string;
    title: string;
    btn_title?: string;
    one_page_link?: string | any;
    one_page_title?: string;
    demo_img?: StaticImageData | any;
  }[];
}[]
// menu data 
const menu_data: DataType[] = [
  {
    id: 1,
    title: "Home",
    link: "/",
    has_dropdown: false,
    // img_dropdown: true,
    // sub_menus: [
    //   { link: "/", title: "Home 01", one_page_link: "/home-1-one-page", demo_img: demo_img_1, },
    //   { link: "/home-2", title: "Home 02", one_page_link: "/home-2-one-page", demo_img: demo_img_2, },
    //   { link: "/home-3", title: "Home 03", one_page_link: "/home-3-one-page", demo_img: demo_img_3, },
    //   { link: "/home-4", title: "Home 04", one_page_link: "/home-4-one-page", demo_img: demo_img_4, },
    //   { link: "/home-5", title: "Home 05", one_page_link: "/home-5-one-page", demo_img: demo_img_5, },
    // ],
  },
  {
    id: 2,
    title: "About",
    link: "/about-us",
    has_dropdown: false,
  },
  // {
  //   id: 3,
  //   title: "Service",
  //   link: "#",
  //   has_dropdown: true,
  //   sub_menus: [
  //     { link: "/service", title: "Services" },
  //     { link: "/service-details", title: "Services Details" },
  //   ],
  // },
  // {
  //   id: 4,
  //   title: "Project",
  //   link: "#",
  //   has_dropdown: true,
  //   sub_menus: [
  //     { link: "/project", title: "Project" },
  //     { link: "/project-details", title: "Project Details" },
  //   ],
  // },
  // {
  //   id: 3,
  //   title: "Blog",
  //   link: "#",
  //   has_dropdown: true,
  //   sub_menus: [
  //     { link: "/blog-classic", title: "Blog Classic" },
  //     { link: "/blog-details", title: "Blog Details" },
  //   ],
  // },
  {
    id: 3,
    title: "Shop",
    link: "/shop",
    has_dropdown: false,
    // img_dropdown: true,
    // sub_menus: [
    //   { link: "/", title: "Home 01", one_page_link: "/home-1-one-page", demo_img: demo_img_1, },
    //   { link: "/home-2", title: "Home 02", one_page_link: "/home-2-one-page", demo_img: demo_img_2, },
    //   { link: "/home-3", title: "Home 03", one_page_link: "/home-3-one-page", demo_img: demo_img_3, },
    //   { link: "/home-4", title: "Home 04", one_page_link: "/home-4-one-page", demo_img: demo_img_4, },
    //   { link: "/home-5", title: "Home 05", one_page_link: "/home-5-one-page", demo_img: demo_img_5, },
    // ],
  },


  // {
  //   id: 6,
  //   title: "Pages",
  //   link: "#",
  //   has_dropdown: true,
  //   sub_menus: [
  //     { link: "/team", title: "Team " },
  //     { link: "/team-details", title: "Team Details" },
  //     { link: "/appointment", title: "appointment" },
  //     { link: "/faq", title: "FAQ" },
  //     { link: "/price", title: "Price" },
  //     { link: "/shop", title: "shop" },
  //     { link: "/shop-details", title: "Shop Details" },
  //     { link: "/cart", title: "cart" },
  //     { link: "/checkout", title: "checkout" },
  //     { link: "/erorr", title: "Erorr" },
  //   ],
  // },
  {
    id: 4,
    title: "Contact",
    link: "/contact",
    has_dropdown: false,
  },
  {
    id: 5,
    title: "Sign In",
    link: "/signin",
    has_dropdown: false,
  },
];
export default menu_data;
