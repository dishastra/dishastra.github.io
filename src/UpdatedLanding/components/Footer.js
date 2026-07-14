import React, { useRef, useState, useEffect } from 'react';
import LogoLoop from './LogoLoop';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Footer.css';

const waitlistLogos = [
  { node: <span>What are you waiting for?</span> },
  { node: <span className="marquee-star">✦</span> },
  { node: <span>Join the waitlist</span> },
  { node: <span className="marquee-star">✦</span> },
];

export const Footer = () => {
  const footerRef = useRef(null);
  
  // Track scroll progress within the Footer section
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  // Hills move down as we scroll up (and vice versa)
  const hillsY = useTransform(scrollYProgress, [0, 1], [100, 0]);

  // Disable hills parallax on mobile/tablet (≤960px)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <div className="pre-footer-section">
        <div className="marquee-container">
          <LogoLoop
            logos={waitlistLogos}
            speed={120}
            direction="left"
            logoHeight="clamp(4rem, 8vw, 7rem)"
            gap={32}
            pauseOnHover={false}
            className="waitlist-marquee"
          />
        </div>
        
        <div className="waitlist-wrapper">
          <div className="waitlist-card">
            <p className="waitlist-text">
              Join other travelers already on the waitlist.<br />
              Spots are limited and granted on a rolling basis.
            </p>
            <div className="waitlist-form">
              <input type="email" placeholder="name@example.com" className="waitlist-input" />
              <button className="waitlist-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                JOIN THE WAITLIST
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer id="contact" className="actual-footer" ref={footerRef}>
        {/* Sky Background */}
        <div 
          className="af-sky-bg" 
          style={{ backgroundImage: `url('${process.env.PUBLIC_URL}/hero-sky.webp')` }}
        ></div>
        <div className="af-sky-overlay"></div>
        
        {/* Landscape Container */}
        <div className="af-landscape-container">
          <motion.h2 
            className="af-massive-text"
            initial={{ y: 250, opacity: 0, x: "-50%" }}
            whileInView={{ y: 0, opacity: 1, x: "-50%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            DISHASTRA
          </motion.h2>
          
          <motion.div 
            className="af-hills-bg" 
            style={{ 
              backgroundImage: `url('${process.env.PUBLIC_URL}/footer-hills.webp')`,
              y: isMobile ? 0 : hillsY 
            }}
          >
            <div className="af-hills-overlay"></div>
          </motion.div>
          
          <div className="af-gradient-mask"></div>
          
          <p className="af-motto">
            Your AI-powered conversational travel companion.<br />
            Perfectly routed adventures in seconds.
          </p>
        </div>
        
        {/* Bottom Bar */}
        <div className="af-bottom">
          <div className="af-bottom-content">
            <div className="af-copyright">© 2026 Dishastra AI. All rights reserved.</div>
            <div className="af-social-links">
              <button className="af-social-icon" aria-label="X (Twitter)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button className="af-social-icon" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </button>
              <button className="af-social-icon" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </button>
              <button className="af-social-icon" aria-label="Email">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
