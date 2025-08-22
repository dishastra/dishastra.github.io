import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Header from './components/Header';
import Lenis from 'lenis';
import './App.css';

import AboutUs from './components/AboutUs';
import OurVision from './components/OurVision';
import OurProduct from './components/OurProduct';
import Contact from './components/Contact';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const globeRef = useRef();
  const [isOverGlobeSphere, setIsOverGlobeSphere] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Start with mobile=true to prevent hydration mismatch
  const [Globe, setGlobe] = useState(null);
  const [CustomCursor, setCustomCursor] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect mobile screen size and conditionally load heavy components
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 600;
      setIsMobile(mobile);
      
      // Only import heavy components on non-mobile devices
      if (!mobile) {
        if (!Globe) {
          import('./components/Globe').then((module) => {
            setGlobe(() => module.default);
          }).catch(error => {
            console.warn('Failed to load Globe component:', error);
          });
        }
        if (!CustomCursor) {
          import('./components/CustomCursor').then((module) => {
            setCustomCursor(() => module.default);
          }).catch(error => {
            console.warn('Failed to load CustomCursor component:', error);
          });
        }
      }
    };
    
    // Ensure this only runs on client-side
    if (typeof window !== 'undefined' && isClient) {
      // Check on mount
      checkMobile();
      
      // Add resize listener
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, [Globe, CustomCursor, isClient]);

  useEffect(() => {
    // Only use Lenis smooth scroll on desktop for performance
    if (!isMobile) {
      const lenis = new Lenis({
        duration: 2.5,        // Duration of scroll animation (default: 1.2)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing function
        smoothWheel: true,    // Smooth wheel scrolling
        smoothTouch: false,   // Disable smooth touch scrolling (can be jarring on mobile)
        wheelMultiplier: 1,   // Wheel sensitivity (default: 1)
        touchMultiplier: 2,   // Touch sensitivity (default: 2)
        infinite: false,      // Infinite scrolling
      });
      
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      
      // Cleanup function
      return () => {
        lenis.destroy();
      };
    }
  }, [isMobile]);

  // Hero section auto-rotation logic
  useEffect(() => {
    // Only set auto-rotation on non-mobile devices
    if (!isMobile && Globe) {
      // Start auto-rotation after 2 seconds
      const heroAutoRotateTimeout = setTimeout(() => {
        globeRef.current?.setAutoRotate(true);
      }, 2000);

      return () => {
        clearTimeout(heroAutoRotateTimeout);
      };
    }
  }, [isMobile, Globe]);

  // Initial setup for ScrollTrigger and GSAP animations
  useEffect(() => {
    // Ensure we're on client-side and DOM is ready
    if (!isClient) return;
    
    // Add a small delay to ensure DOM is fully rendered
    const initAnimations = () => {
      // Skip all animations on mobile for maximum performance
      if (isMobile) {
      // Keep header visible on mobile without animation
      gsap.set('header', {
        y: 0,
        opacity: 1,
      });

      // Ensure About Us section is visible on mobile (override any hidden state)
      const fixAboutUsVisibility = () => {
        const aboutUsSection = document.querySelector('.content-sections > *:first-child');
        if (aboutUsSection) {
          aboutUsSection.style.opacity = '1';
          aboutUsSection.style.visibility = 'visible';
          aboutUsSection.style.transform = 'translateX(0)';
          aboutUsSection.style.display = 'flex';
        }
      };
      
      // Run immediately and after a short delay to ensure DOM is ready
      fixAboutUsVisibility();
      setTimeout(fixAboutUsVisibility, 100);

      // Ensure hero text is visible on mobile
      const fixHeroTextVisibility = () => {
        const heroText = document.querySelector('.hero-text');
        if (heroText) {
          heroText.style.opacity = '1';
          heroText.style.visibility = 'visible';
          heroText.style.display = 'block';
        }
      };
      
      fixHeroTextVisibility();
      setTimeout(fixHeroTextVisibility, 100);

      // Re-enable color transitions for mobile sections
      const contentBoxes = document.querySelectorAll('.content-sections > *');
      contentBoxes.forEach((box, index) => {
        ScrollTrigger.create({
          trigger: box,
          start: 'top 50%', // Trigger when section center reaches viewport center
          end: 'bottom 50%', // End when section center leaves viewport center
          onEnter: () => {
            console.log(`Mobile: Tile ${index + 1} entering view - color inversion`);
            box.classList.add('active');
          },
          onLeave: () => {
            console.log(`Mobile: Tile ${index + 1} leaving view - color normal`);
            box.classList.remove('active');
          },
          onEnterBack: () => {
            console.log(`Mobile: Tile ${index + 1} entering back - color inversion`);
            box.classList.add('active');
          },
          onLeaveBack: () => {
            console.log(`Mobile: Tile ${index + 1} leaving back - color normal`);
            box.classList.remove('active');
          }
        });
      });

      // Prevent scrolling beyond Contact section on mobile
      const preventOverScroll = () => {
        const contactSection = document.querySelector('.content-sections > *:last-child');
        if (contactSection) {
          const contactRect = contactSection.getBoundingClientRect();
          const contactBottom = window.pageYOffset + contactRect.bottom;
          const maxScroll = contactBottom - window.innerHeight;
          
          // Set document height to prevent over-scrolling
          document.body.style.height = `${contactBottom}px`;
          
          // Prevent scrolling beyond contact
          const currentScroll = window.pageYOffset;
          if (currentScroll > maxScroll) {
            window.scrollTo(0, maxScroll);
          }
        }
      };

      // Set initial constraints
      setTimeout(() => {
        preventOverScroll();
      }, 200);

      window.addEventListener('scroll', preventOverScroll);
      window.addEventListener('resize', preventOverScroll);
      
      return () => {
        window.removeEventListener('scroll', preventOverScroll);
        window.removeEventListener('resize', preventOverScroll);
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }

    // Full desktop animations including globe
    // Hide header initially - with safety check
    const headerElement = document.querySelector('header');
    if (headerElement) {
      gsap.set('header', {
        y: -100, // Move header up and out of view
        opacity: 0,
      });
    }

    // Header reveal animation when leaving hero section
    const headerTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.content-sections',
        start: 'top 90%',
        end: 'top 70%',
        scrub: 1,
        onUpdate: (self) => {
          console.log('Header animation progress:', self.progress);
          // Safety check for header element
          const headerElement = document.querySelector('header');
          if (!headerElement) {
            console.warn('Header element not found during animation');
          }
        }
      }
    });

    // Animate header into view - with element check
    const headerElement2 = document.querySelector('header');
    if (headerElement2) {
      headerTl.to('header', {
        y: 0,
        opacity: 1,
        ease: 'power2.out',
      });
    }

    // Hero text fade out animation when leaving hero section
    const heroTextTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.content-sections',
        start: 'top 95%', // Start fading earlier
        end: 'top 80%', // Complete fade before content fully appears
        scrub: 1,
        onUpdate: (self) => {
          console.log('Hero text fade progress:', self.progress);
          // Safety checks for elements
          const heroText = document.querySelector('.hero-text');
          const heroCta = document.querySelector('.hero-cta');
          if (!heroText) console.warn('Hero text element not found during animation');
          if (!heroCta) console.warn('Hero CTA element not found during animation');
        }
      }
    });

    // Fade out hero text and CTA button - with element checks
    const heroTextElement = document.querySelector('.hero-text');
    const heroCtaElement = document.querySelector('.hero-cta');
    
    if (heroTextElement) {
      heroTextTl.to('.hero-text', {
        opacity: 0,
        y: -50, // Move up slightly as it fades
        ease: 'power2.out',
      });
    }

    if (heroCtaElement) {
      heroTextTl.to('.hero-cta', {
        opacity: 0,
        y: 50, // Move down slightly as it fades
        ease: 'power2.out',
      });
    }

    // Globe movement animation - move from center to right when About Us section is reached
    const globeMovementTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.content-sections',
        start: 'top 80%',
        end: 'top 50%', // Much shorter duration - completes quickly when About Us comes into view
        scrub: 1,
        onUpdate: (self) => {
          console.log('Globe movement progress:', self.progress);
        }
      }
    });

    // Move globe container to the right - with element check
    const globeContainer = document.querySelector('.globe-container');
    if (globeContainer) {
      globeMovementTl.to('.globe-container', {
        x: '20vw', // Move right by 25% of viewport width
        ease: 'power2.out', // Faster ease out for quicker movement
      });
    }

    // Separate timeline for gradient transition - with element check
    const gradientElement = document.querySelector('.gradient-transition');
    if (gradientElement) {
      const gradientTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.content-sections',
          start: 'top bottom',
          end: 'top center',
          scrub: 1,
        }
      });

      // Fade in gradient transition overlay
      gradientTl.to('.gradient-transition', {
        opacity: 1,
        ease: 'power2.inOut',
        duration: 0.8
      }, 0);
    }

    // Animate individual content tiles (special handling for About Us vs others)
    const contentBoxes = document.querySelectorAll('.content-sections > *');
    
    contentBoxes.forEach((box, index) => {
      if (index === 0) {
        // About Us tile - fade and slide animation
        gsap.set(box, {
          x: -100,
          autoAlpha: 0,
        });

        gsap.to(box, {
          x: 0,
          autoAlpha: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: box,
            start: 'top 70%', // Start earlier for fade animation
            end: 'top 30%',   // End earlier
            onEnter: self => gsap.to(self.targets, { autoAlpha: 1, x: 0, duration: 1, ease: 'power2.out' }),
            onLeaveBack: self => gsap.to(self.targets, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }),
          }
        });

        // Separate ScrollTrigger for About Us color inversion
        ScrollTrigger.create({
          trigger: box,
          start: 'top 50%', // Same as other tiles
          end: 'bottom 50%', // Same as other tiles
          onEnter: () => {
            console.log(`About Us tile entering view - color inversion`);
            box.classList.add('active');
          },
          onLeave: () => {
            console.log(`About Us tile leaving view - color normal`);
            box.classList.remove('active');
          },
          onEnterBack: () => {
            console.log(`About Us tile entering back - color inversion`);
            box.classList.add('active');
          },
          onLeaveBack: () => {
            console.log(`About Us tile leaving back - color normal`);
            box.classList.remove('active');
          }
        });
      } else {
        // Other tiles - only color inversion, no fade/slide
        gsap.set(box, {
          autoAlpha: 1, // Always visible
          x: 0, // No slide animation
        });

        // Only handle color inversion for other tiles
        ScrollTrigger.create({
          trigger: box,
          start: 'top 50%', // Trigger when section center reaches viewport center
          end: 'bottom 50%', // End when section center leaves viewport center
          onEnter: () => {
            console.log(`Tile ${index + 1} entering view - color inversion`);
            box.classList.add('active');
          },
          onLeave: () => {
            console.log(`Tile ${index + 1} leaving view - color normal`);
            box.classList.remove('active');
          },
          onEnterBack: () => {
            console.log(`Tile ${index + 1} entering back - color inversion`);
            box.classList.add('active');
          },
          onLeaveBack: () => {
            console.log(`Tile ${index + 1} leaving back - color normal`);
            box.classList.remove('active');
          }
        });
      }
    });

    // ScrollTrigger for globe auto-rotation in content sections only
    const contentSectionsElement = document.querySelector('.content-sections');
    if (contentSectionsElement) {
      const autoRotateTrigger = ScrollTrigger.create({
        trigger: '.content-sections',
        start: 'top 90%',
        end: 'bottom 10%',
        onEnter: () => {
          // Only enable if we're entering content sections
          globeRef.current?.setAutoRotate(true);
        },
        onLeaveBack: () => {
          // When scrolling back to hero, keep auto-rotation on
          globeRef.current?.setAutoRotate(true);
        },
        onLeave: () => {
          // When leaving content sections (scrolling past them), disable auto-rotation
          globeRef.current?.setAutoRotate(false);
        },
        onEnterBack: () => {
          // When scrolling back into content sections from below, enable auto-rotation
          globeRef.current?.setAutoRotate(true);
        },
      });
    }

    // Cleanup function to kill ScrollTrigger instances on component unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
    
    };

    // Add a small delay to ensure DOM elements are available
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAnimations);
    } else {
      setTimeout(initAnimations, 100);
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initAnimations);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMobile, isClient]);

  return (
    <div className="bg-black">
      {!isMobile && CustomCursor && <CustomCursor />}
      <Header />

      <div className="main-container">
        <section className="globe-hero-section">
          {/* Hero text that fades out when scrolling */}
          <div className="hero-text">
            <h1>A ONE-STOP SOLUTION TO YOUR NAVIGATION PROBLEMS</h1>
          </div>
          
          <div className="globe-container" data-cursor-hover>
            {!isMobile && Globe && <Globe ref={globeRef} onGlobeHoverChange={setIsOverGlobeSphere} />}
          </div>

          {/* Get Started button */}
          <div className="hero-cta">
            <a 
              href="https://www.youtube.com/watch?v=Ub_WCWflmds" 
              target="_blank" 
              rel="noopener noreferrer"
              className="get-started-btn"
            >
              <span className="shadow"></span>
              <span className="edge"></span>
              <span className="front">GET STARTED</span>
            </a>
          </div>
        </section>

        {/* Gradient transition overlay */}
        <div className="gradient-transition"></div>

        <div className="content-sections">
          <AboutUs />
          <OurVision />
          <OurProduct />
          <Contact />
        </div>
      </div>
    </div>
  );
}

export default App;
