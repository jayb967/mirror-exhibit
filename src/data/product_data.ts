

import { StaticImageData } from "next/image";

import product_img_1 from "@/assets/img/product/product-1-1.jpg";
import product_img_2 from "@/assets/img/product/product-1-2.jpg";
import product_img_3 from "@/assets/img/product/product-1-3.jpg";


// home 2
import product_img_2_1 from "@/assets/img/product/thumb-1-1.jpg";
import product_img_2_2 from "@/assets/img/product/thumb-1-2.jpg";
import product_img_2_3 from "@/assets/img/product/thumb-1-3.jpg";
import product_img_2_4 from "@/assets/img/product/thumb-1-4.jpg";

// home 3
import product_img_3_1 from "@/assets/img/product/thumb-1-1.jpg";
import product_img_3_2 from "@/assets/img/product/thumb-1-2.jpg";
import product_img_3_3 from "@/assets/img/product/thumb-1-3.jpg";
import product_img_3_4 from "@/assets/img/product/thumb-1-4.jpg";



interface DataType {
  path: string;
  img: StaticImageData;
  price: number;
  title: string;
}


const product_data: DataType[] = [
  {
    path: 'home_1',
    img: product_img_1,
    price: 29,
    title: `Floor layout <br /> guide`,
  },
  {
    path: 'home_1',
    img: product_img_2,
    price: 32,
    title: `Map of the <br /> Store`,
  },
  {
    path: 'home_1',
    img: product_img_3,
    price: 45,
    title: `Plan of the <br /> Floor`,
  },
  {
    path: 'home_1',
    img: product_img_1,
    price: 32,
    title: `Map of the <br /> Store`,
  },

  // home 2 
  {
    path: 'home_2',
    img: product_img_2_1,
    price: 19,
    title: `Elevate Home`,
  },
  {
    path: 'home_2',
    img: product_img_2_2,
    price: 39,
    title: `Dream Space`,
  },
  {
    path: 'home_2',
    img: product_img_2_3,
    price: 69,
    title: `Create Oasis`,
  },
  {
    path: 'home_2',
    img: product_img_2_4,
    price: 29,
    title: `RedefineComfort`,
  },
  // repeat home 2
  {
    path: 'home_2',
    img: product_img_2_1,
    price: 19,
    title: `Elevate Home`,
  },
  {
    path: 'home_2',
    img: product_img_2_2,
    price: 39,
    title: `Dream Space`,
  },
  {
    path: 'home_2',
    img: product_img_2_3,
    price: 69,
    title: `Create Oasis`,
  },
  {
    path: 'home_2',
    img: product_img_2_4,
    price: 29,
    title: `RedefineComfort`,
  },

  // home 3
  {
    path: 'home_3',
    img: product_img_3_1,
    price: 19,
    title: `Elevate <br /> Home`,
  },
  {
    path: 'home_3',
    img: product_img_3_2,
    price: 49,
    title: `Experience <br />Style`,
  },
  {
    path: 'home_3',
    img: product_img_3_3,
    price: 29,
    title: `Create <br /> Oasis`,
  },
  {
    path: 'home_3',
    img: product_img_3_4,
    price: 19,
    title: `Transform <br /> Spac`,
  },
  // repeat for home 3
  {
    path: 'home_3',
    img: product_img_3_1,
    price: 19,
    title: `Elevate <br /> Home`,
  },
  {
    path: 'home_3',
    img: product_img_3_2,
    price: 49,
    title: `Experience <br />Style`,
  },
  {
    path: 'home_3',
    img: product_img_3_3,
    price: 29,
    title: `Create <br /> Oasis`,
  },
  {
    path: 'home_3',
    img: product_img_3_4,
    price: 19,
    title: `Transform <br /> Spac`,
  },

]
export default product_data