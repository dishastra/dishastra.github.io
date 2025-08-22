import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CustomCursor = () => {
  const circleRef = useRef(null);
  const followRef = useRef(null);

  useEffect(() => {
    const circle = circleRef.current;
    const follow = followRef.current;

    if (!circle || !follow) return;

    const moveCircle = (e) => {
      gsap.to(circle, {
        duration: 0,
        x: e.clientX,
        y: e.clientY
      });
      gsap.to(follow, {
        duration: 0.4,
        x: e.clientX,
        y: e.clientY
      });
    };

    const expandCursor = () => {
      gsap.to(follow, {
        duration: 0.3,
        scale: 1.7,
        ease: 'power2.out'
      });
      gsap.to(circle, {
        duration: 0.3,
        scale: 1.2,
        ease: 'power2.out'
      });
    };

    const shrinkCursor = () => {
      gsap.to(follow, {
        duration: 0.3,
        scale: 1,
        ease: 'power2.out'
      });
      gsap.to(circle, {
        duration: 0.3,
        scale: 1,
        ease: 'power2.out'
      });
    };

    const disableInversion = () => {
      if (circle) circle.style.mixBlendMode = 'normal';
      if (follow) follow.style.mixBlendMode = 'normal';
    };

    const enableInversion = () => {
      if (circle) circle.style.mixBlendMode = 'exclusion';
      if (follow) follow.style.mixBlendMode = 'exclusion';
    };

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Add event listeners
    window.addEventListener('mousemove', moveCircle);

    // Add hover detection for interactive elements (excluding globe)
    const interactiveElements = document.querySelectorAll('a, button, .get-started-btn, [data-cursor-hover]:not(.globe-container)');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', expandCursor);
      element.addEventListener('mouseleave', shrinkCursor);
    });

    // Special handling for globe container - disable color inversion
    const globeContainer = document.querySelector('.globe-container');
    if (globeContainer) {
      globeContainer.addEventListener('mouseenter', disableInversion);
      globeContainer.addEventListener('mouseleave', enableInversion);
    }

    // Cleanup function
    return () => {
      // Remove event listeners safely
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', moveCircle);
      }
      
      // Clean up interactive elements event listeners
      const currentInteractiveElements = document.querySelectorAll('a, button, .get-started-btn, [data-cursor-hover]:not(.globe-container)');
      currentInteractiveElements.forEach(element => {
        element.removeEventListener('mouseenter', expandCursor);
        element.removeEventListener('mouseleave', shrinkCursor);
      });
      
      // Clean up globe container event listeners
      const currentGlobeContainer = document.querySelector('.globe-container');
      if (currentGlobeContainer) {
        currentGlobeContainer.removeEventListener('mouseenter', disableInversion);
        currentGlobeContainer.removeEventListener('mouseleave', enableInversion);
      }
      
      // Restore default cursor
      if (document.body) {
        document.body.style.cursor = 'auto';
      }
    };
  }, []);

  return (
    <>
      <div
        ref={circleRef}
        id="circle"
        className="custom-cursor-circle"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '14px',
          height: '14px',
          backgroundColor: 'white',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'exclusion'
        }}
      />
      <div
        ref={followRef}
        id="circle-follow"
        className="custom-cursor-follow"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '45px',
          height: '45px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'exclusion'
        }}
      />
    </>
  );
};

export default CustomCursor;
