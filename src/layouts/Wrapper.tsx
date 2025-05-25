"use client";

import { gsap } from 'gsap';
import { useEffect, useCallback, useRef } from "react";
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


// Optimized lazy import for heavy operations
const hoverWebGl = () => import("@/utils/hoverWebgl").then(module => module.default());

// Performance monitoring
const getDevicePerformance = () => {
  if (typeof window === "undefined") return "high";

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return "low";
  }

  // Basic performance heuristics
  const connection = (navigator as any)?.connection;
  const memory = (performance as any)?.memory;

  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
    return "low";
  }

  if (memory && memory.usedJSHeapSize > memory.totalJSHeapSize * 0.8) {
    return "medium";
  }

  return "high";
};

const Wrapper = ({ children }: any) => {
  const performanceLevel = useRef(getDevicePerformance());
  const animationsInitialized = useRef(false);

  // Optimized ScrollSmoother configuration based on device performance
  const getScrollSmootherConfig = useCallback(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const performance = performanceLevel.current;

    const configs = {
      high: {
        smooth: isMobile ? 0.6 : 1.0,
        effects: !isMobile,
        smoothTouch: false,
        normalizeScroll: false,
        ignoreMobileResize: true,
      },
      medium: {
        smooth: isMobile ? 0.4 : 0.8,
        effects: false,
        smoothTouch: false,
        normalizeScroll: false,
        ignoreMobileResize: true,
      },
      low: {
        smooth: 0,
        effects: false,
        smoothTouch: false,
        normalizeScroll: true,
        ignoreMobileResize: true,
      }
    };

    return configs[performance] || configs.medium;
  }, []);

  // Initialize ScrollSmoother with performance-based config
  useEffect(() => {
    if (typeof window !== "undefined") {
      const config = getScrollSmootherConfig();


      ScrollSmoother.create(config);
    }
  }, [getScrollSmootherConfig]);

  // Defer heavy animations using requestIdleCallback
  useEffect(() => {
    if (animationsInitialized.current) return;

    const initializeAnimations = () => {
      if (typeof window === "undefined") return;

      // Use requestIdleCallback for non-critical animations
      const scheduleWork = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(callback, { timeout: 2000 });
        } else {
          setTimeout(callback, 100);
        }
      };

      // Initialize animations based on performance level
      if (performanceLevel.current !== "low") {
        scheduleWork(() => {

          animationTitle();
          scrollSmother();
        });

        // Initialize WebGL effects for all devices
        scheduleWork(() => {
          hoverWebGl().catch(err => {
            console.warn("WebGL initialization failed:", err);
          });
        });
      }

      animationsInitialized.current = true;
    };

    // Delay initialization to avoid blocking initial render
    const timeoutId = setTimeout(initializeAnimations, 100);

    return () => clearTimeout(timeoutId);
  }, []);



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
