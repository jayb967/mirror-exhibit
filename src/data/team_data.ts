

import { StaticImageData } from 'next/image';
import avatar_img_1 from '@/assets/img/team/team-1-1.jpg';
import avatar_img_2 from '@/assets/img/team/team-1-2.jpg';
import avatar_img_3 from '@/assets/img/team/team-1-3.jpg';

import avatar_img_5_1 from '@/assets/img/team/team-5-1.jpg';
import avatar_img_5_2 from '@/assets/img/team/team-5-2.jpg';
import avatar_img_5_3 from '@/assets/img/team/team-5-3.jpg';
import avatar_img_5_4 from '@/assets/img/team/team-5-4.jpg';
import avatar_img_5_5 from '@/assets/img/team/team-5-5.jpg'; 
import avatar_img_5_6 from '@/assets/img/team/team-5-6.jpg'; 


interface DataType {
  path: string;
  img: StaticImageData;
  name: string;
  designation: string;
}


const team_data: DataType[] = [
  {
    path: "home_2",
    img: avatar_img_1,
    name: `Leslie Alexander`,
    designation: `Medical Assistant`,
  },
  {
    path: "home_2",
    img: avatar_img_2,
    name: `Albert Flores`,
    designation: `Dog Trainer`,
  },
  {
    path: "home_2",
    img: avatar_img_3,
    name: `Cameron Williamson`,
    designation: `Nursing Assistant`,
  },
  // repeat home 2
  {
    path: "home_2",
    img: avatar_img_1,
    name: `Leslie Alexander`,
    designation: `Medical Assistant`,
  },
  {
    path: "home_2",
    img: avatar_img_2,
    name: `Albert Flores`,
    designation: `Dog Trainer`,
  },
  {
    path: "home_2",
    img: avatar_img_3,
    name: `Cameron Williamson`,
    designation: `Nursing Assistant`,
  },
  // home 5
  {
    path: "home_5",
    img: avatar_img_5_1,
    name: `Leslie Alexander`,
    designation: `Medical Assistant`,
  },
  {
    path: "home_5",
    img: avatar_img_5_2,
    name: `Cameron Willi`,
    designation: `Nursing Assistant`,
  },
  {
    path: "home_5",
    img: avatar_img_5_3,
    name: `Jacob Jones`,
    designation: `Dog Trainert`,
  },

  {
    path: "home_5",
    img: avatar_img_5_4,
    name: `Dog Trainer`,
    designation: `Albert Flores`,
  },
  // team page
  {
    path: "team",
    img: avatar_img_5_1,
    name: `Leslie Alexander`,
    designation: `Medical Assistant`,
  },
  {
    path: "team",
    img: avatar_img_5_2,
    name: `Cameron Willi`,
    designation: `Nursing Assistant`,
  },
  {
    path: "team",
    img: avatar_img_5_3,
    name: `Jacob Jones`,
    designation: `Dog Trainert`,
  },
  {
    path: "team",
    img: avatar_img_5_4,
    name: `Dog Trainer`,
    designation: `Albert Flores`,
  },
  {
    path: "team",
    img: avatar_img_5_5,
    name: `Albert Flores`,
    designation: `Marketing Coordinator`,
  },
  {
    path: "team",
    img: avatar_img_5_6,
    name: `Dog Trainer`,
    designation: `President of Sales`,
  },
]

export default team_data