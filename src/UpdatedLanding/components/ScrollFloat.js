import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollFloat.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollFloat — character-by-character scrub reveal driven by GSAP ScrollTrigger.
 * Ported from React Bits (TypeScript+Tailwind) to plain JS + CSS.
 *
 * Props:
 *   children           – string text to animate
 *   scrollContainerRef – optional ref to a custom scroll container (defaults to window)
 *   containerClassName – extra CSS class on the <p> wrapper
 *   textClassName      – extra CSS class on the inner <span>
 *   animationDuration  – seconds per character animation
 *   ease               – GSAP easing string
 *   scrollStart        – ScrollTrigger start position
 *   scrollEnd          – ScrollTrigger end position
 *   stagger            – delay between character animations
 */
const ScrollFloat = ({
  children,
  scrollContainerRef,
  containerClassName = '',
  textClassName = '',
  animationDuration = 1,
  ease = 'back.inOut(2)',
  scrollStart = 'center bottom+=50%',
  scrollEnd = 'bottom bottom-=40%',
  stagger = 0.03,
}) => {
  const containerRef = useRef(null);

  /* Split the string into words, then characters, to prevent mid-word breaks */
  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    const words = text.split(' ');
    
    return words.map((word, wordIndex) => (
      <span 
        key={wordIndex} 
        style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
      >
        {word.split('').map((char, charIndex) => (
          <span className="sf-char" key={charIndex}>
            {char}
          </span>
        ))}
        {/* Add space after word, except for the last word */}
        {wordIndex !== words.length - 1 && (
          <span className="sf-char">&nbsp;</span>
        )}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef?.current ? scrollContainerRef.current : window;

    const charElements = el.querySelectorAll('.sf-char');

    const tween = gsap.fromTo(
      charElements,
      {
        willChange: 'opacity, transform',
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: '50% 0%',
      },
      {
        duration: animationDuration,
        ease,
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        stagger,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
          once: true, // "one time animation", won't disappear when scrolling up
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

  return (
    <p
      ref={containerRef}
      className={`sf-container ${containerClassName}`}
    >
      <span className={`sf-text ${textClassName}`}>
        {splitText}
      </span>
    </p>
  );
};

export default ScrollFloat;
