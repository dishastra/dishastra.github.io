import React from 'react';
import './UnderConstruction.css'; // Assuming you want to add custom styles

export const UnderConstruction = () => {
  return (
    <div className="under-construction-container">
      <div className="under-construction-content">
        <h1>We're Under Construction</h1>
        <p>We're working hard to bring you something amazing. Stay tuned!</p>
        <div className="construction-image">
          {/*<img src="/path/to/your/construction-image.png" alt="Under Construction" >*/}
        </div>
      </div>
    </div>
  );
};

