import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import dishaStraLogo from '../assets/invert_disha_pin.png';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  
  const navItems = [
    { name: 'ABOUT US', href: '#about' },
    { name: 'OUR VISION', href: '#vision' },
    { name: 'OUR PRODUCT', href: '#product' },
    { name: 'CONTACT', href: '#contact' }
  ];

  const navRefs = useRef([]);

  // Custom scramble text function
  const scrambleText = (element, originalText) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const textLength = originalText.length;
    let iteration = 0;

    const tl = gsap.timeline();

    tl.to({}, {
      duration: 0.8,
      ease: "none",
      onUpdate: function() {
        const progress = this.progress();
        iteration = Math.floor(progress * textLength);
        
        let scrambledText = originalText
          .split("")
          .map((char, index) => {
            if (char === ' ') return ' ';
            
            if (index < iteration) {
              return originalText[index];
            }
            
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");

        element.textContent = scrambledText;
      },
      onComplete: () => {
        element.textContent = originalText;
      }
    });

    return tl;
  };

  const handleMouseEnter = (index) => {
    const element = navRefs.current[index];
    if (element) {
      const originalText = navItems[index].name;
      scrambleText(element, originalText);
    }
  };

  const handleNavClick = (e, href) => {
    e.preventDefault();
    
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    
    const targetId = href.substring(1); // Remove the '#' from href
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerHeight = 80; // Header height (5rem = 80px)
      const heroSectionHeight = window.innerHeight; // Hero section is 100vh
      const targetRect = targetElement.getBoundingClientRect();
      const currentScrollY = window.pageYOffset;
      
      // Calculate the absolute position of the target element
      const targetAbsoluteTop = currentScrollY + targetRect.top;
      
      // Position the target element so it appears right below the header
      const scrollToPosition = targetAbsoluteTop - headerHeight;
      
      window.scrollTo({
        top: Math.max(0, scrollToPosition),
        behavior: 'smooth'
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Animation for mobile menu
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMobileMenuOpen) {
        gsap.to(mobileMenuRef.current, {
          x: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(mobileMenuRef.current, {
          x: "100%",
          duration: 0.3,
          ease: "power2.in"
        });
      }
    }
  }, [isMobileMenuOpen]);

  // Animation for hamburger lines
  useEffect(() => {
    if (hamburgerRef.current) {
      const lines = hamburgerRef.current.querySelectorAll('.hamburger-line');
      if (isMobileMenuOpen) {
        gsap.to(lines[0], { rotation: 45, y: "0.375rem", duration: 0.15 });
        gsap.to(lines[1], { opacity: 0, duration: 0.1 });
        gsap.to(lines[2], { rotation: -45, y: "-0.375rem", duration: 0.15 });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.15 });
        gsap.to(lines[1], { opacity: 1, duration: 0.1 });
        gsap.to(lines[2], { rotation: 0, y: 0, duration: 0.15 });
      }
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="w-full bg-black border-b border-white/20" style={{ height: '5rem' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8" style={{ height: '100%' }}>
          <div className="flex items-center justify-between" style={{ height: '100%', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src={dishaStraLogo} 
                alt="Dishastra" 
                style={{ height: '8vh', width: 'auto' }}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="desktop-nav flex items-center" style={{ gap: '4rem', height: '100%' }}>
              {navItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  ref={el => navRefs.current[index] = el}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onClick={(e) => handleNavClick(e, item.href)}
                  data-cursor-hover
                  className="text-white hover:text-gray-300 transition-colors duration-300 font-medium text-sm tracking-wide cursor-pointer"
                  style={{ 
                    padding: '0 0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    fontFamily: 'monospace',
                    fontSize: '1rem'
                  }}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              ref={hamburgerRef}
              onClick={toggleMobileMenu}
              className="mobile-hamburger"
              style={{ 
                width: '2rem', 
                height: '2rem',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              aria-label="Toggle mobile menu"
            >
              <div className="hamburger-line" style={{ width: '1.5rem', height: '0.125rem', backgroundColor: 'white' }}></div>
              <div className="hamburger-line" style={{ width: '1.5rem', height: '0.125rem', backgroundColor: 'white' }}></div>
              <div className="hamburger-line" style={{ width: '1.5rem', height: '0.125rem', backgroundColor: 'white' }}></div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        className="mobile-menu fixed bg-black border border-white/20"
        style={{
          top: '5rem',
          right: 0,
          width: '100%',
          height: 'calc(100vh - 5rem)',
          zIndex: 25,
          transform: 'translateX(100%)',
          backgroundColor: 'rgba(0, 0, 0, 0.98)'
        }}
      >
        <nav className="flex flex-col items-center justify-center h-full" style={{ gap: '3rem' }}>
          {navItems.map((item, index) => (
            <a
              key={`mobile-${item.name}`}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-white hover:text-gray-300 transition-colors duration-300 font-medium tracking-wide cursor-pointer"
              style={{
                fontSize: '1.5rem',
                fontFamily: 'monospace',
                padding: '1rem'
              }}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-backdrop fixed inset-0 bg-black bg-opacity-50"
          style={{ zIndex: 20, top: '5rem' }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header; 