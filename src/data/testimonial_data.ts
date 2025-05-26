

import { StaticImageData } from 'next/image';
// testimonial img - using public path since images are in public directory
const testimonial_img_1 = '/assets/img/testimonial/thumb-1-1.jpg';
const testimonial_img_2 = '/assets/img/testimonial/thumb-1-2.jpg';

const testimonial_img_5_1 = '/assets/img/testimonial/avata-1-1.png';
const testimonial_img_5_2 = '/assets/img/testimonial/avata-1-2.png';

interface DataType {
  path: string;
  img?: string;
  name: string;
  designation: string;
  description: string;
}

const testimonial_data: DataType[] = [
  // home 2
  {
    path: 'home_1',
    img: testimonial_img_1,
    name: 'Sarah P.',
    designation: ``,
    description: `I got the mirror with his favorite car brand engraved for his birthday, and he was blown away. The craftsmanship is top-notch, and the metal frame fits so perfectly with our modern decor. It’s such a unique, personal touch, and now I’m thinking of getting one for my office!`,
  },
  {
    path: 'home_1',
    img: testimonial_img_2,
    name: 'Lisa M.',
    designation: ``,
    description: `A Statement Piece in My Home! I was looking for something to really elevate my living room, and this mirror was exactly what I needed. Every time guests come over, it’s the first thing they notice. Honestly, it’s more than just a mirror – it’s art!`,
  },
  {
    path: 'home_1',
    img: testimonial_img_1,
    name: 'Megan S.',
    designation: ``,
    description: `I've never had a piece of decor that felt so personalized and high-end. I chose a quote that really means something to me, and it’s engraved beautifully on the mirror. It’s honestly transformed my bedroom into a luxury space.`,
  },
  {
    path: 'home_1',
    img: testimonial_img_2,
    name: 'Emily T.',
    designation: ``,
    description: `I was looking for a statement mirror for our entryway, and being able to customize it was such a bonus. I went with a classic wood frame, and it’s absolutely stunning. The mirror adds a sense of class to the space, and the engraving of our family name was the perfect touch.`,
  },
  {
    path: 'home_1',
    img: testimonial_img_1,
    name: 'David L.',
    designation: ``,
    description: `I wanted something unique for my office, and this mirror was it! The engraving of my company’s logo is so sharp, and the quality is fantastic. It adds such an upscale vibe to the whole room. Every client that walks in notices it right away. Totally worth it!`,
  },
  // home 2
  {
    path: 'home_2',
    name: 'Wade Warren',
    designation: `Marketing Coordinator`,
    description: `loborti viverra laoreet matti ullamcorper posuere in viverra Aliquam eros justo, posuere lobortis non dei Aliquam eros justo, posuere loborti`,
  },
  {
    path: 'home_2',
    name: 'Julio Davis',
    designation: `Marketing Coordinator`,
    description: `loborti viverra laoreet matti ullamcorper posuere in viverra Aliquam eros justo, posuere lobortis non dei Aliquam eros justo, posuere loborti`,
  },
  {
    path: 'home_2',
    name: 'Jean Macdonald',
    designation: `Marketing Coordinator`,
    description: `loborti viverra laoreet matti ullamcorper posuere in viverra Aliquam eros justo, posuere lobortis non dei Aliquam eros justo, posuere loborti`,
  },

  // home 5
  {
    path: 'home_5',
    img: testimonial_img_5_1,
    name: 'Esther Howard',
    designation: `Marketing Coordinator`,
    description: `loborti viverra laoreet matti ullamcorper posuere in viverra Aliquam eros justo, posuere lobortis non dei Aliquam eros justo, posuere loborti`,
  },
  {
    path: 'home_5',
    img: testimonial_img_5_2,
    name: 'Cody Fisher',
    designation: `Marketing Coordinator`,
    description: `loborti viverra laoreet matti ullamcorper posuere in viverra Aliquam eros justo, posuere lobortis non dei Aliquam eros justo, posuere loborti`,
  },
  {
    path: 'home_5',
    img: testimonial_img_5_1,
    name: 'Jean Macdonald',
    designation: `Marketing Coordinator`,
    description: `loborti viverra laoreet matti ullamcorper posuere in viverra Aliquam eros justo, posuere lobortis non dei Aliquam eros justo, posuere loborti`,
  },
  {
    path: 'home_5',
    img: testimonial_img_5_2,
    name: 'Julio Davis',
    designation: `Marketing Coordinator`,
    description: `loborti viverra laoreet matti ullamcorper posuere in viverra Aliquam eros justo, posuere lobortis non dei Aliquam eros justo, posuere loborti`,
  },



]

export default testimonial_data