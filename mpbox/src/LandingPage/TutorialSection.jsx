// Tutorial.jsx
import tutorial from './tutorial.mp4';
import React, { useEffect, useRef, useState } from 'react';
import './TutorialSection.css'; // Optional: create a CSS file for specific styles

export const Tutorial = () => {
const [isVisible, setIsVisible] = useState(false);
  const tutorialSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (tutorialSectionRef.current) {
      observer.observe(tutorialSectionRef.current);
    }

    return () => {
      if (tutorialSectionRef.current) {
        observer.unobserve(tutorialSectionRef.current);
      }
    };
  }, []);

  return (
    <div id="tutorial"
    ref={tutorialSectionRef}
    className={`tutorial-section ${isVisible ? 'visible' : ''}`}>
      <div className="tutorial-content">
        <h2>Tutorial</h2>
        <div className="video-container">
          <video className="tutorial-video" controls>
            <source src={tutorial} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

