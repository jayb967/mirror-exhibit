"use client";

import { gsap } from 'gsap';
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "@/components/common/ScrollToTop";


import { scrollSmother } from "@/utils/scrollSmother";
import animationTitle from "@/utils/animationTitle";

import { ScrollSmoother, ScrollToPlugin, ScrollTrigger, SplitText } from "@/plugins";
gsap.registerPlugin(ScrollSmoother, ScrollTrigger, ScrollToPlugin, SplitText);



if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}


// test function 
import hoverWebGl from "@/utils/hoverWebgl";
import { useDispatch } from 'react-redux';
import { get_cart_products } from '@/redux/features/cartSlice';


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

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(get_cart_products());;
  }, [dispatch]);


  return <>
    {children}
    <ScrollToTop />
    <ToastContainer position="top-center" />
  </>;
};

export default Wrapper;
