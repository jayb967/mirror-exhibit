

import { StaticImageData } from "next/image";
import project_img_1 from "@/assets/img/project/project-6-1.jpg";
import project_img_2 from "@/assets/img/project/project-6-2.jpg";
import project_img_3 from "@/assets/img/project/project-6-3.jpg";
import project_img_4 from "@/assets/img/project/project-6-4.jpg";

// home 2
import project_img_5 from "@/assets/img/project/project-2-1.jpg";
import project_img_6 from "@/assets/img/project/project-2-2.jpg";
import project_img_7 from "@/assets/img/project/project-2-3.jpg";


// home 3
import project_img_8 from "@/assets/img/project/project-3-1.jpg";
import project_img_9 from "@/assets/img/project/project-3-2.jpg";
import project_img_10 from "@/assets/img/project/project-3-3.jpg";
import project_img_11 from "@/assets/img/project/project-3-4.jpg";
import project_img_12 from "@/assets/img/project/project-3-5.jpg";

// home 5
import project_img_13 from "@/assets/img/project/project-5-1.jpg";
import project_img_14 from "@/assets/img/project/project-5-2.jpg";
import project_img_15 from "@/assets/img/project/project-5-3.jpg";
import project_img_16 from "@/assets/img/project/project-5-4.jpg";
import project_img_17 from "@/assets/img/project/project-5-5.jpg";

// project 
import project_img_18 from "@/assets/img/project/project-4-1.jpg";
import project_img_19 from "@/assets/img/project/project-4-2.jpg";
import project_img_20 from "@/assets/img/project/project-4-3.jpg";
import project_img_21 from "@/assets/img/project/project-4-4.jpg";
import project_img_22 from "@/assets/img/project/project-4-5.jpg";
import project_img_23 from "@/assets/img/project/project-4-6.jpg";

// shop details 
import project_img_24 from "@/assets/img/product/thumb-1-1.jpg";
import project_img_25 from "@/assets/img/product/thumb-1-2.jpg";
import project_img_26 from "@/assets/img/product/thumb-1-3.jpg";
import project_img_27 from "@/assets/img/product/thumb-1-4.jpg";





interface DataType {
  path: string;
  price?: number;
  category?: string | any;
  img: StaticImageData;
  title: string;
  description?: string;
}


const project_data: DataType[] = [
  {
    path: "home_1",
    category: 'Exterior',
    img: project_img_1,
    title: `New York Gallery`,
  },
  {
    path: "home_1",
    category: 'Side View',
    img: project_img_2,
    title: `New York Gallery`,
  },
  {
    path: "home_1",
    category: 'Worldwide',
    img: project_img_3,
    title: `New York Gallery`,
  },
  {
    path: "home_1",
    category: 'Countrylife',
    img: project_img_4,
    title: `New York Gallery`,
  },

  // reapt
  {
    path: "home_1",
    category: 'Side View',
    img: project_img_1,
    title: `New York Gallery`,
  },
  {
    path: "home_1",
    category: 'Countrylife',
    img: project_img_2,
    title: `New York Gallery`,
  },
  {
    path: "home_1",
    category: 'Exterior',
    img: project_img_3,
    title: `New York Gallery`,
  },
  {
    path: "home_1",
    category: 'Worldwide',
    img: project_img_4,
    title: `New York Gallery`,
  },

  // home 2 
  {
    path: "home_2",
    img: project_img_5,
    title: `Las vegas Gallery`,
  },
  {
    path: "home_2",
    img: project_img_6,
    title: `New York Gallery`,
  },
  {
    path: "home_2",
    img: project_img_7,
    title: `St jones Gallery`,
  },
  // reapt for home 2
  {
    path: "home_2",
    img: project_img_6,
    title: `Las vegas Gallery`,
  },
  // home 4
  {
    path: "home_4",
    img: project_img_8,
    title: `Cloud Migrate Pro`,
  },
  {
    path: "home_4",
    img: project_img_9,
    title: `Newyork golf club house`,
  },
  {
    path: "home_4",
    img: project_img_10,
    title: `California young menz club`,
  },
  {
    path: "home_4",
    img: project_img_11,
    title: `Tech Solutions`,
  },
  {
    path: "home_4",
    img: project_img_12,
    title: `Huge large area Bedroom`,
  },
  // home 5 
  {
    path: "home_5",
    img: project_img_13,
    title: `California Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "home_5",
    img: project_img_14,
    title: `Las vegas Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "home_5",
    img: project_img_15,
    title: `St jones Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "home_5",
    img: project_img_16,
    title: `Newyork golf club housey`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "home_5",
    img: project_img_17,
    title: `Sunlight in the Room`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  // repeat for home 5
  {
    path: "home_5",
    img: project_img_13,
    title: `California Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "home_5",
    img: project_img_14,
    title: `Las vegas Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "home_5",
    img: project_img_15,
    title: `St jones Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "home_5",
    img: project_img_16,
    title: `Newyork golf club housey`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "home_5",
    img: project_img_17,
    title: `Sunlight in the Room`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },

  // project
  {
    path: "project",
    category: 'Exterior',
    img: project_img_18,
    title: `New York Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Side View',
    img: project_img_19,
    title: `Las vegas Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Worldwide',
    img: project_img_20,
    title: `St jones Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Countrylife',
    img: project_img_21,
    title: `California Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Worldwide',
    img: project_img_22,
    title: `Newyork golf club house`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Exterior',
    img: project_img_23,
    title: `Newyork golf club house`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  // reapit
  {
    path: "project",
    category: 'Worldwide',
    img: project_img_18,
    title: `New York Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Countrylife',
    img: project_img_19,
    title: `Las vegas Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Exterior',
    img: project_img_18,
    title: `New York Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Side View',
    img: project_img_19,
    title: `Las vegas Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Side View',
    img: project_img_21,
    title: `California Gallery`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Countrylife',
    img: project_img_22,
    title: `Newyork golf club house`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "project",
    category: 'Exterior',
    img: project_img_23,
    title: `Newyork golf club house`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  // shop details 
  {
    path: "shop-details",
    price: 19,
    img: project_img_24,
    title: `Elevate <br /> Home`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "shop-details",
    price: 29,
    img: project_img_25,
    title: `Redefine <br /> Comfort`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "shop-details",
    price: 39,
    img: project_img_26,
    title: `Create <br /> Oasis`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "shop-details",
    price: 49,
    img: project_img_27,
    title: `Dream <br /> Space`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  // repit for shop details 
  {
    path: "shop-details",
    price: 19,
    img: project_img_24,
    title: `Elevate <br /> Home`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "shop-details",
    price: 29,
    img: project_img_25,
    title: `Redefine <br /> Comfort`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "shop-details",
    price: 39,
    img: project_img_26,
    title: `Create <br /> Oasis`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },
  {
    path: "shop-details",
    price: 49,
    img: project_img_27,
    title: `Dream <br /> Space`,
    description: `orem npsum dolor sit conse cteturs adipiscing elit`,
  },

]
export default project_data