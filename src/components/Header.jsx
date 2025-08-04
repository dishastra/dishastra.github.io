import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import dishaStraLogo from '../assets/invert_disha_pin.png';

const Header = () => {
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
    
    const targetId = href.substring(1); // Remove the '#' from href
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      const headerHeight = 80; // Header height
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

  return (
    <header className="w-full bg-black border-b border-white/20" style={{ height: '80px' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8" style={{ height: '100%' }}>
        <div className="flex items-center justify-between" style={{ height: '100%', paddingLeft: '24px', paddingRight: '24px' }}>
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src={dishaStraLogo} 
              alt="Dishastra" 
              style={{ height: '8vh', width: 'auto' }}
            />
          </div>

          {/* Navigation */}
          <nav className="flex items-center" style={{ gap: '64px', height: '100%' }}>
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
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  fontFamily: 'monospace', // Monospace font for consistent character spacing during scramble
                  fontSize: '16px'
                }}
              >
                {item.name}
              </a>
            ))}
          </nav>


        </div>
      </div>
    </header>
  );
};

export default Header; 