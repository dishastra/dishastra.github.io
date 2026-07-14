import React, { useRef } from 'react';
import LogoLoop from './LogoLoop';
import { motion, useScroll, useTransform } from 'framer-motion';
import './MidSection.css';

const HighlightPara = ({ children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 15%"]
  });

  // When scrolling through the viewport, fade in and scale up at the center
  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.2, 1, 1, 0.2]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.p
      ref={ref}
      className="ms-para-text"
      style={{ opacity, scale, transformOrigin: 'center' }}
    >
      {children}
    </motion.p>
  );
};

/* ── Logo items — SVG from /public + name label ───────────────── */
const logos = [
  {
    node: (
      <span className="ms-logo-item">
        <img
          src={process.env.PUBLIC_URL + '/maptiler.svg'}
          alt=""
          aria-hidden="true"
          className="ms-logo-svg"
        />
        <span className="ms-logo-name">MapTiler</span>
      </span>
    ),
    title: 'MapTiler',
  },
  {
    node: (
      <span className="ms-logo-item">
        <img
          src={process.env.PUBLIC_URL + '/maplibre.svg'}
          alt=""
          aria-hidden="true"
          className="ms-logo-svg"
        />
        <span className="ms-logo-name">MapLibre</span>
      </span>
    ),
    title: 'MapLibre',
  },
  {
    node: (
      <span className="ms-logo-item">
        <img
          src={process.env.PUBLIC_URL + '/openstreetmap.svg'}
          alt=""
          aria-hidden="true"
          className="ms-logo-svg"
        />
        <span className="ms-logo-name">OpenStreetMap</span>
      </span>
    ),
    title: 'OpenStreetMap',
  },
];

/* ─────────────────────────────────────────────────────────────── */

export const MidSection = () => {
  return (
    <section className="ms-section" aria-label="About Dishastra">

      {/* ── Intro paragraphs — block highlighting on scroll ── */}
      <div className="ms-intro-wrap">
        <HighlightPara>
          Dishastra is a conversational travel planner that turns a single prompt into a fully planned adventure. Just describe your ideal getaway, and watch it generate an optimised, day-by-day itinerary in seconds.
        </HighlightPara>

        <HighlightPara>
          Designed to be effortlessly intuitive, the platform features a clean Minimalist Mode. It strips away complex settings, providing a distraction-free interface that makes advanced trip planning accessible to absolutely everyone.
        </HighlightPara>

        <HighlightPara>
          From initial discovery to on-the-go guidance, Dishastra handles the heavy lifting. Export your complete itinerary with a single tap and focus entirely on the adventure, even when you drop off the grid.
        </HighlightPara>
      </div>

      {/* ── Powered By ───────────────────────────────────────────── */}
      <div className="ms-powered-wrap">
        <p className="ms-powered-label" aria-label="Powered by">
          POWERED BY
        </p>

        <div className="ms-marquee-wrap">
          <LogoLoop
            logos={logos}
            speed={40}
            direction="left"
            logoHeight={40}
            gap={100}
            hoverSpeed={0}
            fadeOut
            fadeOutColor="#000000"
            ariaLabel="Technologies powering Dishastra"
          />
        </div>
      </div>

    </section>
  );
};
