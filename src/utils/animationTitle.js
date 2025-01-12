
import { gsap } from "gsap";
import { SplitText } from "@/plugins";

const animationTitle = () => {

  if (typeof window !== 'undefined') {

    const st = document.querySelectorAll('.tp-split-text');
    if (st.length === 0) return;

    gsap.registerPlugin(SplitText);

    st.forEach(el => {
      const split = new SplitText(el, {
        type: 'lines,words,chars',
        linesClass: 'tp-split-line'
      });
      gsap.set(el, { perspective: 400 });

      if (el.classList.contains('tp-split-in-right')) {
        gsap.set(split.chars, {
          opacity: 0,
          x: '50',
          ease: 'Back.easeOut'
        });
      }
      if (el.classList.contains('tp-split-in-left')) {
        gsap.set(split.chars, {
          opacity: 0,
          x: '-50',
          ease: 'circ.out'
        });
      }
      if (el.classList.contains('tp-split-in-up')) {
        gsap.set(split.chars, {
          opacity: 0,
          y: '80',
          ease: 'circ.out'
        });
      }
      if (el.classList.contains('tp-split-in-down')) {
        gsap.set(split.chars, {
          opacity: 0,
          y: '-80',
          ease: 'circ.out'
        });
      }

      el.anim = gsap.to(split.chars, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%'
        },
        x: '0',
        y: '0',
        rotateX: '0',
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.02
      });
    });

    return () => {
      st.forEach(el => {
        if (el.anim) el.anim.kill();
      });
    };

  }



};

export default animationTitle;