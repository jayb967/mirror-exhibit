"use client";

import { gsap } from 'gsap';
import { useEffect, useCallback, useRef } from "react";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "@/components/common/ScrollToTop";
import FloatingCartButton from "@/components/common/FloatingCartButton";


import { scrollSmother } from "@/utils/scrollSmother";
import animationTitle from "@/utils/animationTitle";
import performanceMonitor from "@/utils/performanceMonitor";

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
      console.log(`🚀 Initializing ScrollSmoother with ${performanceLevel.current} performance config:`, config);

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
          console.log("🎨 Initializing animations...");
          animationTitle();
          scrollSmother();
        });

        // Defer WebGL effects for high-performance devices only
        if (performanceLevel.current === "high") {
          scheduleWork(() => {
            console.log("🎮 Initializing WebGL effects...");
            hoverWebGl().catch(err => {
              console.warn("WebGL initialization failed:", err);
            });
          });
        }
      }

      animationsInitialized.current = true;
    };

    // Delay initialization to avoid blocking initial render
    const timeoutId = setTimeout(initializeAnimations, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Start monitoring scroll performance
    const cleanupScrollMonitor = performanceMonitor.monitorScrollPerformance();

    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      performanceMonitor.monitorMemoryUsage();
    }, 30000); // Every 30 seconds

    // Log performance summary after page load
    const summaryTimeout = setTimeout(() => {
      performanceMonitor.logSummary();
    }, 5000);

    return () => {
      cleanupScrollMonitor();
      clearInterval(memoryInterval);
      clearTimeout(summaryTimeout);
      performanceMonitor.cleanup();
    };
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
