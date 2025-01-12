

import HeaderOne from "@/layouts/headers/HeaderOne";
import HeroAreaHomeOne from "../../multi-page/home-3/HeroAreaHomeOne";
import ServiceAreaHomeOne from "../../multi-page/home-3/ServiceAreaHomeOne";
import AboutAreaHomeOne from "../../multi-page/home-3/AboutAreaHomeOne";
import FunFactAreaHomeOne from "../../multi-page/home-3/FunFactAreaHomeOne";
import TestimonialAreaHomeOne from "../../multi-page/home-3/TestimonialAreaHomeOne";
import ProjectAreaHomeOne from "../../multi-page/home-3/ProjectAreaHomeOne";
import ProductAreaHomeOne from "../../multi-page/home-3/ProductAreaHomeOne";
import BlogAreaHomeOne from "../../multi-page/home-3/BlogAreaHomeOne";
import BrandAreaHomeOne from "../../multi-page/home-3/BrandAreaHomeOne";
import ContactAreaHomeOne from "../../multi-page/home-3/ContactAreaHomeOne";
import FooterOne from "@/layouts/footers/FooterOne";


const HomeOneSinglePage = () => {
  return (
    <>
      <HeaderOne  onePageHomeOne={true} />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <HeroAreaHomeOne />
            <ServiceAreaHomeOne />
            <AboutAreaHomeOne style_2={false} />
            <FunFactAreaHomeOne style_2={false} />
            <TestimonialAreaHomeOne />
            <ProjectAreaHomeOne />
            <ProductAreaHomeOne />
            <BlogAreaHomeOne />
            <BrandAreaHomeOne />
            <ContactAreaHomeOne />
          </main>
          <FooterOne />
        </div>
      </div>
    </>
  );
};

export default HomeOneSinglePage;