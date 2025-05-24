import { StaticImageData } from "next/image";

import demo_img_1 from "@/assets/img/menu/home-1.jpg";
import demo_img_2 from "@/assets/img/menu/home-2.jpg";
import demo_img_3 from "@/assets/img/menu/home-3.jpg";
import demo_img_4 from "@/assets/img/menu/home-4.jpg";
import demo_img_5 from "@/assets/img/menu/home-5.jpg";

interface DataType {
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
    title: "Home",
    link: "/",
    has_dropdown: false,
  },
  {
    title: "About",
    link: "/about-us",
    has_dropdown: false,
  },
  {
    title: "Shop",
    link: "/shop",
    has_dropdown: false,
  },
  {
    title: "Contact",
    link: "/contact",
    has_dropdown: false,
  },
];
export default menu_data;
