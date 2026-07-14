import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import './FeaturesSection.css';

const features = [
  {
    title: 'Neural Intelligence',
    desc: 'Powered by intelligent travel planners. Instantly transform your raw ideas into highly optimized, executable schedules.',
    lottieFile: '/Brain.json',
  },
  {
    title: 'Always Connected',
    desc: 'Reliable offline access. Export your entire itinerary with one tap and access it anywhere, even without internet.',
    lottieFile: '/Multi Cluster.json',
  },
  {
    title: 'Social Discovery',
    desc: 'Simpler to discover. Instantly extract locations from Instagram Reels, with support for other platforms coming soon.',
    lottieFile: '/Community.json',
  },
  {
    title: 'Interactive Map',
    desc: 'Experience the world in real-time. Seamlessly search, filter, and discover live events across the globe.',
    lottieFile: '/Ticket 1.json',
  },
];

const FeatureCard = ({ title, desc, lottieFile, isHovered, onMouseEnter, onMouseLeave }) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + lottieFile)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Error loading lottie:', err));
  }, [lottieFile]);

  return (
    <li 
      className={`fs-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <h3 className="fs-card-title">{title}</h3>
      <div className="fs-card-icon-slot">
        {animationData ? (
          <Lottie animationData={animationData} loop={true} autoplay={true} className="fs-lottie" />
        ) : (
          <div className="fs-lottie-placeholder" />
        )}
      </div>
      <p className="fs-card-desc">{desc}</p>
    </li>
  );
};

export const FeaturesSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="fs-section" aria-labelledby="features-heading">
      <div className="fs-container">
        <header className="fs-header-wrap">
          <h2 id="features-heading" className="fs-heading">
            Your intelligent travel companion<br />
            is officially available in <span className="fs-heading-highlight">Closed Beta.</span>
          </h2>
          
          <p className="fs-subheading">
            Stop assembling your travel plans piece by piece. Let us do the planning for you, so you don't have to juggle between blogs, maps, and booking sites across multiple tabs.
          </p>
        </header>

        <ul className="fs-cards-grid">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              title={feature.title} 
              desc={feature.desc} 
              lottieFile={feature.lottieFile} 
              isHovered={hoveredCard === index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
};
