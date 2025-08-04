import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Default animation options
    const defaultOptions = {
      trigger: element,
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
      ...options
    };

    // Set initial state
    gsap.set(element, {
      opacity: 0,
      y: 50,
      scale: 0.95
    });

    // Create scroll-triggered animation
    const scrollTrigger = ScrollTrigger.create({
      ...defaultOptions,
      onEnter: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power2.out"
        });
      },
      onLeave: () => {
        gsap.to(element, {
          opacity: 0,
          y: -30,
          scale: 0.95,
          duration: 0.8,
          ease: "power2.in"
        });
      },
      onEnterBack: () => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out"
        });
      },
      onLeaveBack: () => {
        gsap.to(element, {
          opacity: 0,
          y: 50,
          scale: 0.95,
          duration: 0.8,
          ease: "power2.in"
        });
      }
    });

    // Cleanup
    return () => {
      if (scrollTrigger) {
        scrollTrigger.kill();
      }
    };
  }, []);

  return elementRef;
}; 