import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Hero } from './components/Hero';
import { MidSection } from './components/MidSection';
import { FeaturesSection } from './components/FeaturesSection';
import { Footer } from './components/Footer';
import { Loader } from './components/Loader';
import './UpdatedLanding.css';

/* ── Critical images to preload before showing the page ──────── */
const CRITICAL_IMAGES = [
  '/hero-sky.webp',
  '/hero-hills.webp',
  '/hero-dashboard.webp',
  '/footer-hills.webp',
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    // Always resolve (not reject) so a single slow/failed image
    // doesn't block the whole page forever.
    img.onload = resolve;
    img.onerror = resolve;
    img.src = process.env.PUBLIC_URL + src;
  });
}

export const UpdatedLanding = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Kick off all preloads in parallel
    Promise.all(CRITICAL_IMAGES.map(preloadImage)).then(() => {
      // Give the browser one extra frame to paint before revealing
      requestAnimationFrame(() => setIsReady(true));
    });
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isReady && <Loader key="loader" />}
      </AnimatePresence>

      {isReady && (
        <motion.div
          className="updated-landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Hero />
          <main>
            <MidSection />
            <FeaturesSection />
          </main>
          <Footer />
        </motion.div>
      )}
    </>
  );
};
