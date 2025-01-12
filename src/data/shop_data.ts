
import product_img_1 from "@/assets/img/product/thumb-1-5.jpg";
import product_img_2 from "@/assets/img/product/thumb-1-10.jpg";
import product_img_3 from "@/assets/img/product/thumb-1-7.jpg";
import product_img_4 from "@/assets/img/product/thumb-1-8.jpg";
import product_img_5 from "@/assets/img/product/thumb-1-11.jpg";
import product_img_6 from "@/assets/img/product/thumb-1-9.jpg";
import product_img_7 from "@/assets/img/product/thumb-1-12.jpg";
import product_img_8 from "@/assets/img/product/thumb-1-13.jpg";
import product_img_9 from "@/assets/img/product/thumb-1-14.jpg";
const placeholder = "@/assets/img/product/placeholder.jpg";


import { StaticImageData } from "next/image";


interface DataType {
  id: number;
  category: string;
  img: StaticImageData;
  title: string;
  price: number;
}


const shop_data: DataType[] = [
  {
    id: 1,
    category: "Home Deco",
    img: placeholder,
    title: `Elevate Home`,
    price: 200,
  },
  {
    id: 2,
    category: "Lighting",
    img: placeholder,
    title: `Decor Plants`,
    price: 100,
  },
  {
    id: 3,
    category: "Furniture",
    img: placeholder,
    title: `Brown Lamp`,
    price: 150,
  },
  {
    id: 4,
    category: "Flooring",
    img: placeholder,
    title: `Teal Rug`,
    price: 50,
  },
  {
    id: 5,
    category: "Wall Art",
    img: placeholder,
    title: `White Armchair`,
    price: 100,
  },
  {
    id: 6,
    category: "Home Deco",
    img: placeholder,
    title: `Black Vase`,
    price: 250,
  },
  {
    id: 7,
    category: "Lighting",
    img: placeholder,
    title: `Snake Plant`,
    price: 245,
  },
  {
    id: 8,
    category: "Furniture",
    img: placeholder,
    title: `Center Table`,
    price: 857,
  },
  {
    id: 9,
    category: "Flooring",
    img: placeholder,
    title: `Dream Space`,
    price: 968,
  },
  // more data
  {
    id: 10,
    category: "Wall Art",
    img: placeholder,
    title: `Elevate Home`,
    price: 200,
  },
  {
    id: 11,
    category: "Home Deco",
    img: product_img_2,
    title: `Decor Plants`,
    price: 100,
  },
  {
    id: 12,
    category: "Lighting",
    img: product_img_3,
    title: `Brown Lamp`,
    price: 150,
  },
  {
    id: 13,
    category: "Furniture",
    img: product_img_4,
    title: `Teal Rug`,
    price: 50,
  },
  {
    id: 14,
    category: "Flooring",
    img: product_img_5,
    title: `White Armchair`,
    price: 100,
  },
  {
    id: 15,
    category: "Wall Art",
    img: product_img_6,
    title: `Black Vase`,
    price: 999,
  },
  {
    id: 16,
    category: "Home Deco",
    img: product_img_7,
    title: `Snake Plant`,
    price: 897,
  },
  {
    id: 17,
    category: "Lighting",
    img: product_img_8,
    title: `Center Table`,
    price: 857,
  },
  {
    id: 18,
    category: "Furniture",
    img: product_img_9,
    title: `Dream Space`,
    price: 968,
  },
  {
    id: 19,
    category: "Flooring",
    img: product_img_8,
    title: `Center Table`,
    price: 857,
  },
  {
    id: 20,
    category: "Wall Art",
    img: product_img_9,
    title: `Dream Space`,
    price: 968,
  },


]
export default shop_data

