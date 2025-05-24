"use client";

import { gsap } from 'gsap';
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "@/components/common/ScrollToTop";
import FloatingCartButton from "@/components/common/FloatingCartButton";


import { scrollSmother } from "@/utils/scrollSmother";
import animationTitle from "@/utils/animationTitle";

import { ScrollSmoother, ScrollToPlugin, ScrollTrigger, SplitText } from "@/plugins";
gsap.registerPlugin(ScrollSmoother, ScrollTrigger, ScrollToPlugin, SplitText);



if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}


// test function
import hoverWebGl from "@/utils/hoverWebgl";



const Wrapper = ({ children }: any) => {



  useEffect(() => {
    if (typeof window !== "undefined") {
      ScrollSmoother.create({
        smooth: 1.35,
        effects: true,
        smoothTouch: false,
        normalizeScroll: false,
        ignoreMobileResize: true,
      });
    }
  }, []);


  useEffect(() => {

    hoverWebGl()
    animationTitle()
    scrollSmother();
  }, [])

  // Cart initialization is now handled in StoreProvider


  return <>
    {children}
    <ScrollToTop />
    <FloatingCartButton />
    <ToastContainer
      position="top-center"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      limit={1}
    />
  </>;
};

export default Wrapper;
