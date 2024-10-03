import React, { useEffect, useState } from 'react';
import Hamburger from 'hamburger-react'
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import free_art_sih from './free_art_sih.mp4';
import sihlogo from './sihlogotrans.png';
import { AboutSection } from './AboutSection';
import { Tutorial } from './TutorialSection';

export const LandingPage = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen((open) => !open)
  }
  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleSectionScroll = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
      sectionElement.classList.add('highlight');
      setTimeout(() => {
        sectionElement.classList.remove('highlight');
      }, 2400); // Remove highlight after 3 seconds
    }
  };
  
  const handleTutorial = () => {
    document.getElementById('tutorial').scrollIntoView({behavior: 'smooth'});
  }

  useEffect(() => {
    // Dynamically load the Botpress webchat scripts
    const script1 = document.createElement('script');
    script1.src = "https://cdn.botpress.cloud/webchat/v2.2/inject.js";
    script1.async = true;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://files.bpcontent.cloud/2024/10/03/17/20241003174539-IGMPP6LK.js';

    script2.async = true;
    document.body.appendChild(script2);

    // Clean up scripts on component unmount
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return (
    <div className="landing-container">
      <div className="topbar">
        <div className="logo">
          <img src={sihlogo} alt="Company Logo" className="logo-image" />
        </div>
        <div className={`about-us ${isOpen ? "is-open" : ""}`}>
          <button className="about-us" onClick={handleTutorial}>Tutorial</button>
          <button className="about-us" onClick={() => handleSectionScroll('aboutsec')}>About Us</button>
          <button className="about-us" onClick={() => handleSectionScroll('vision')}>Our Vision</button>
          <button className="about-us" onClick={() => handleSectionScroll('product')}>Our Product</button>
          <button className="about-us" onClick={() => handleSectionScroll('contact')}>Contact</button>
        </div>
        <div className='about-us_trigger' onClick={toggleMenu}>
        <Hamburger color = "#000000" toggled = {isOpen} toggle={setIsOpen} />
        </div>
      </div>
      <div className="video-background">
        <video className="background-video" autoPlay loop muted>
          <source src={free_art_sih} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="get-started-container">
        <button className="get-started-button" onClick={handleGetStarted}>Get Started ➜</button>
      </div>
      <Tutorial />
      <AboutSection />
    </div>
  );
};
