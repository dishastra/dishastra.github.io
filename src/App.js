// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {UpdatedLanding} from './UpdatedLanding/UpdatedLanding'; // Adjust the path if necessary
// import { LoginPage } from './LoginPage/LoginPage';
// import { MapComponent } from './MapComponent/MapComponent';
import {UnderConstruction} from './UnderConstruction/UnderConstruction';
import { CookiesProvider } from 'react-cookie';


function App() {
  return (
    <CookiesProvider><Router>
      <Routes>
        <Route path ="/" element={<UpdatedLanding />}/>
        <Route path='*' element={<UnderConstruction/>} />
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/map" element={<MapComponent />} /> */}
      </Routes>
    </Router>
    </CookiesProvider>
    /*<div className="App">
      <UpdatedLanding />
    </div>*/
  );
}

export default App;
