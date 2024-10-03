import React, { useEffect, useRef, useState } from 'react';
import './AboutSection.css'; // Import the CSS file

export const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const aboutSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (aboutSectionRef.current) {
      observer.observe(aboutSectionRef.current);
    }

    return () => {
      if (aboutSectionRef.current) {
        observer.unobserve(aboutSectionRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={aboutSectionRef}
      id="about"
      className={`about-section ${isVisible ? 'visible' : ''}`}
    >
      <div className="about-content">
        <div className="box-container">
          <div id = "aboutsec" className="info-box">
            <h3>About Us</h3>
            <p>We are a team of six dedicated students passionate about technology and innovation. This project is the result of our collaborative effort, creativity, and hard work as we strive to bring our ideas to life. Our goal is to create something meaningful and impactful, while learning and growing along the way.
            </p>
          </div>
          <div id="vision" className="info-box">
            <h3>Our Vision</h3>
            <p>The aim was to create an affordable model using map-matching algorithm to predict vehicular movement even during insufficient satellite coverage. As of now the market pricing will depend on the deployment scale of the model and the service level agreements with the respective cloud providers/brokers. We aim to keep cheap yet affordable rates for this service initially giving a pre-determined number of free calls/requests</p>
          </div>
          <div id="product" className="info-box">
            <h3>Our Product</h3>
            <p>We have leveraged advanced APIs to accurately map-match and predict user coordinates, and refined the map matching process with other underlying techniques, we ensure accurate map matching even if the satellite coverage is insufficient.</p>
          </div>
          <div id="contact" className="contact-box">
            <h3>Contact</h3>
            <p>dishastra@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
