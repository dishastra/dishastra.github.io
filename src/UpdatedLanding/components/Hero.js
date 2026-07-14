import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Hero.css';

export const Hero = () => {
  const ref = useRef(null);
  
  // Track mobile state for disabling parallax
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 960 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track scroll progress within the Hero section
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  // Dashboard slides down further and continues for most of the scroll
  const dashboardY = useTransform(scrollYProgress, [0, 0.6], [0, 90]);

  // Hills image comes up until 45% of Hero scroll, then stops
  const hillsY = useTransform(scrollYProgress, [0, 0.45], [0, -150]);

  return (
    /* section.nl-hero — flex column, gap: 50px, padding: 245px 40px 297.81px */
    <section className="nl-hero" ref={ref}>

      {/* Layer 0 — bg%20hero.png: absolute, 1920×1379, z-index 0 */}
      <img
        src={process.env.PUBLIC_URL + '/hero-sky.webp'}
        alt=""
        className="nl-hero-bg"
        aria-hidden="true"
      />

      {/* Layer 1 — nl-hero-overlay: absolute inset, 6-stop gradient, z-index 1 */}
      <div className="nl-hero-overlay" aria-hidden="true" />

      {/* Layer 2 — nl-hero-content: flex col, gap 22px, z-index 2 */}
      <div className="nl-hero-content">
        <motion.h1 
          className="nl-hero-heading"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          The intelligent travel companion<br />
          for <em>every journey you take.</em>
        </motion.h1>
        <motion.p 
          className="nl-hero-subtitle"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          Your journey, our priority. Powered by AI, tailored for you.
        </motion.p>
        {/* CTA margin wrapper: padding-top 4px */}
        <motion.div 
          className="nl-cta-row-margin"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <div className="nl-cta-row">
            <a href="https://dishastra.saigal.dev/" target="_blank" rel="noopener noreferrer" id="nl-try-beta" className="nl-btn-hero">Join the Beta</a>
          </div>
        </motion.div>
      </div>

      {/* Layer 3 — nl-dashboard-wrap-margin: padding-top 25px, z-index 3 */}
      <motion.div 
        className="nl-dashboard-wrap-margin"
        initial={{ y: 800 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <motion.div className="nl-dashboard-card" style={{ y: dashboardY }}>
          <img
            src={process.env.PUBLIC_URL + '/hero-hills.webp'}
            alt="Dishastra app dashboard"
            className="nl-dashboard-img"
          />
        </motion.div>
      </motion.div>

      {/* Layer 4 — nl-hills-wrap: absolute, top: 680px, height: 999px, z-index 4
          ::after handled via CSS: gradient bottom: 300px stop */}
      <motion.div 
        className="nl-hills-wrap" 
        aria-hidden="true"
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <motion.div className="nl-hills-inner" style={{ y: isMobile ? 0 : hillsY }}>
          <img
            src={process.env.PUBLIC_URL + '/hero-dashboard.webp'}
            alt=""
            className="nl-hills-img"
          />
        </motion.div>
      </motion.div>

    </section>
  );
};
