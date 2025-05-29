"use client";

import { gsap } from 'gsap';
import { useEffect, useCallback, useRef } from "react";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "@/components/common/ScrollToTop";
import FloatingCartButton from "@/components/common/FloatingCartButton";


import { scrollSmother } from "@/utils/scrollSmother";
import animationTitle from "@/utils/animationTitle";


import { ScrollSmoother, ScrollToPlugin, ScrollTrigger, SplitText } from "@/plugins";

// Add error handling for GSAP plugin registration
try {
  console.log('🔍 SSR DEBUG: About to register GSAP plugins')
  gsap.registerPlugin(ScrollSmoother, ScrollTrigger, ScrollToPlugin, SplitText);
  console.log('🔍 SSR DEBUG: GSAP plugins registered successfully')
} catch (error) {
  console.error('🔍 SSR DEBUG: Error registering GSAP plugins:', error)
  console.error('🔍 SSR DEBUG: GSAP plugin error name:', (error as any)?.name)
  console.error('🔍 SSR DEBUG: GSAP plugin error message:', (error as any)?.message)

  // Check if this is the constructor error we're looking for
  if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
    console.error('🔍 SSR DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN GSAP PLUGINS! ***')
  }
}



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
  console.log('🔍 SSR DEBUG: Wrapper component starting')

  try {
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
      try {
        const config = getScrollSmootherConfig();

        // Add delay to ensure DOM is ready and GSAP is fully loaded
        setTimeout(() => {
          try {
            if (window.gsap && ScrollSmoother) {
              ScrollSmoother.create(config);
            } else {
              console.warn("GSAP or ScrollSmoother not available");
            }
          } catch (error) {
            console.warn("ScrollSmoother creation failed:", error);
          }
        }, 100);
      } catch (error) {
        console.warn("ScrollSmoother initialization error:", error);
      }
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
          try {
            animationTitle();
            // Add delay and error handling for scrollSmother
            setTimeout(() => {
              try {
                scrollSmother();
              } catch (error) {
                console.warn("ScrollSmother initialization failed:", error);
              }
            }, 500); // Delay to ensure GSAP is fully loaded
          } catch (error) {
            console.warn("Animation initialization failed:", error);
          }
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

    console.log('🔍 SSR DEBUG: About to render Wrapper children')

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
  } catch (error) {
    console.error('🔍 SSR DEBUG: Error in Wrapper:', error)
    console.error('🔍 SSR DEBUG: Wrapper error name:', (error as any)?.name)
    console.error('🔍 SSR DEBUG: Wrapper error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 SSR DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN WRAPPER! ***')
    }

    throw error
  }
};

export default Wrapper;
