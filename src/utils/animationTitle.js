
import { gsap } from "gsap";
import { SplitText } from "@/plugins";

// Performance optimization: throttle animation initialization
let animationInitialized = false;
let animationQueue = [];

const animationTitle = () => {
  if (typeof window !== 'undefined') {
    // Prevent multiple initializations
    if (animationInitialized) return;

    const st = document.querySelectorAll('.tp-split-text');
    if (st.length === 0) return;

    gsap.registerPlugin(SplitText);

    // Use requestAnimationFrame for better performance
    const initializeAnimations = () => {
      st.forEach((el, index) => {
        // Stagger initialization to prevent blocking
        setTimeout(() => {
          // Check if element is still in DOM
          if (!document.contains(el)) return;

          const split = new SplitText(el, {
            type: 'lines,words,chars',
            linesClass: 'tp-split-line'
          });

          gsap.set(el, { perspective: 400 });

          // Optimize initial states
          let initialState = { opacity: 0 };

          if (el.classList.contains('tp-split-in-right')) {
            initialState.x = '50';
          } else if (el.classList.contains('tp-split-in-left')) {
            initialState.x = '-50';
          } else if (el.classList.contains('tp-split-in-up')) {
            initialState.y = '80';
          } else if (el.classList.contains('tp-split-in-down')) {
            initialState.y = '-80';
          }

          gsap.set(split.chars, initialState);

          // Create animation with performance optimizations
          el.anim = gsap.to(split.chars, {
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              toggleActions: 'play none none reverse', // Only play when needed
              fastScrollEnd: true, // Optimize for fast scrolling
            },
            x: '0',
            y: '0',
            rotateX: '0',
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.02,
            ease: 'power2.out', // More performant easing
            force3D: true, // Force hardware acceleration
          });
        }, index * 50); // Stagger initialization
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initializeAnimations, { timeout: 2000 });
    } else {
      setTimeout(initializeAnimations, 100);
    }

    animationInitialized = true;

    return () => {
      st.forEach(el => {
        if (el.anim) {
          el.anim.kill();
          el.anim = null;
        }
      });
      animationInitialized = false;
    };
  }
};

export default animationTitle;