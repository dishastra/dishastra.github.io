// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {LandingPage} from './LandingPage/LandingPage'; // Adjust the path if necessary
// import { LoginPage } from './LoginPage/LoginPage';
// import { MapComponent } from './MapComponent/MapComponent';
import { CookiesProvider } from 'react-cookie';


function App() {
  return (
    <CookiesProvider><Router>
      <Routes>
        <Route path ="/" element={<LandingPage />}/>
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/map" element={<MapComponent />} /> */}
      </Routes>
    </Router>
    </CookiesProvider>
    /*<div className="App">
      <LandingPage />
    </div>*/
  );
}

export default App;
