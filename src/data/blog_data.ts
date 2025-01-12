

import { StaticImageData } from "next/image";
import blog_img_1 from "@/assets/img/blog/blog1-1.jpg";
import blog_img_2 from "@/assets/img/blog/blog1-2.jpg";
// home 3
import blog_img_3_1 from "@/assets/img/blog/blog2-1.jpg";
import blog_img_3_2 from "@/assets/img/blog/blog2-2.jpg";
import blog_img_3_3 from "@/assets/img/blog/blog2-3.jpg";
// home 4
import blog_img_4_1 from "@/assets/img/blog/blog4-1.jpg";
import blog_img_4_2 from "@/assets/img/blog/blog4-2.jpg";
import blog_img_4_3 from "@/assets/img/blog/blog4-3.jpg";

// home 4
import blog_img_5_1 from "@/assets/img/blog/blog4-1.jpg";
import blog_img_5_2 from "@/assets/img/blog/blog5-2.jpg";
import blog_img_5_3 from "@/assets/img/blog/blog5-3.jpg";


interface DataType {
  path: string;
  img: StaticImageData;
  date: string;
  comments: number;
  title: string;
}

const blog_data: DataType[] = [
  {
    path: 'home_1',
    img: blog_img_1,
    date: 'October 19',
    comments: 5,
    title: 'Living Experience with Luxurious Interiors',
  },
  {
    path: 'home_1',
    img: blog_img_2,
    date: 'October 24',
    comments: 5,
    title: 'The Power of Thoughtful Interior Design',
  },
  {
    path: 'home_1',
    img: blog_img_1,
    date: 'October 19',
    comments: 10,
    title: 'Living Experience with Luxurious Interiors',
  },
  {
    path: 'home_1',
    img: blog_img_2,
    date: 'October 24',
    comments: 1,
    title: 'The Power of Thoughtful Interior Design',
  },
  // home 3

  {
    path: 'home_3',
    img: blog_img_3_1,
    date: 'October 94',
    comments: 5,
    title: 'The Power of Thoughtful Interior Design',
  },
  {
    path: 'home_3',
    img: blog_img_3_2,
    date: 'October 24',
    comments: 7,
    title: 'The Power of Thoughtful Interior Design',
  },
  {
    path: 'home_3',
    img: blog_img_3_3,
    date: 'October 28',
    comments: 1,
    title: 'The Power of Thoughtful Interior Design',
  },
  // home 4
  {
    path: 'home_4',
    img: blog_img_4_1,
    date: 'October 17',
    comments: 8,
    title: 'Imagination with Stunning Interior Possibilities',
  },
  {
    path: 'home_4',
    img: blog_img_4_2,
    date: 'October 19',
    comments: 1,
    title: 'Living Experience with Luxurious Interiors',
  },
  {
    path: 'home_4',
    img: blog_img_4_3,
    date: 'October 17',
    comments: 5,
    title: 'Comfort and Elegance with Interior Solutions',
  },
  // repeat for home 4
  {
    path: 'home_4',
    img: blog_img_4_1,
    date: 'October 17',
    comments: 8,
    title: 'Imagination with Stunning Interior Possibilities',
  },
  {
    path: 'home_4',
    img: blog_img_4_2,
    date: 'October 19',
    comments: 1,
    title: 'Living Experience with Luxurious Interiors',
  },
  {
    path: 'home_4',
    img: blog_img_4_3,
    date: 'October 17',
    comments: 5,
    title: 'Comfort and Elegance with Interior Solutions',
  },
  // home 5
  {
    path: 'home_5',
    img: blog_img_5_1,
    date: 'October 17',
    comments: 5,
    title: 'Imagination with Stunning Interior Possibilities',
  },
  {
    path: 'home_5',
    img: blog_img_5_2,
    date: 'October 19',
    comments: 5,
    title: 'Living Space with Modern Interior Concepts',
  },
  {
    path: 'home_5',
    img: blog_img_5_3,
    date: 'October 25',
    comments: 5,
    title: 'Dream Space with Skilled Interior Experts',
  },
  // repeat for home 5
  {
    path: 'home_5',
    img: blog_img_5_1,
    date: 'October 17',
    comments: 5,
    title: 'Imagination with Stunning Interior Possibilities',
  },
  {
    path: 'home_5',
    img: blog_img_5_2,
    date: 'October 19',
    comments: 5,
    title: 'Living Space with Modern Interior Concepts',
  },
  {
    path: 'home_5',
    img: blog_img_5_3,
    date: 'October 25',
    comments: 5,
    title: 'Dream Space with Skilled Interior Experts',
  },

]
export default blog_data