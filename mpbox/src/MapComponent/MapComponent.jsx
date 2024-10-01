import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker, NavigationControl, FullscreenControl, GeolocateControl, Popup } from "react-map-gl";
import { useState, useEffect } from "react";
import tollboothimg from './tollbooth.png';
import { useCookies } from 'react-cookie';
import './MapComponent.css';

export const MapComponent = () => {
  const [viewport, setViewport] = useState({
    latitude: 24.587957, // 88.017373, 176 57.165303, // Initial latitude
    longitude: 88.017373,//66.127852, // Initial longitude
    zoom: 13,
    width: "100vw",
    height: "100vh",
  });
  const [tollBooth, setTollBooth] = useState(null); // State for TollBooth location
  const [bearing, setBearing] = useState(null);
  const [bearingNum, setBearingNum] = useState(null);
  const [cookies] = useCookies(['authToken']); // Retrieve the authToken from cookies

  const [latInput, setLatInput] = useState(viewport.latitude);
  const [longInput, setLongInput] = useState(viewport.longitude);
  const [bearingList, setBearingList] = useState([])
  const [bearingListShow, setBearingListShow] = useState([])
  const [branching, setbranching] = useState(0)
  const [prompted, setPrompted] = useState(false);

  // const { latitude, longitude } = viewport;


  const fetchCoordinates = async () => {
    const { latitude, longitude } = viewport;
    var endpoint = `http://127.0.0.1:8000/api/${latitude},${longitude}`//?bearing=${bearing}`;

    if (branching===1){
      //setBearing(bearingList[bearingNum])
      endpoint = `http://127.0.0.1:8000/api/${latitude},${longitude}?bearing=${bearing}`;
    }

    
    
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Token ${cookies.authToken}`,
        'Content-Type': 'application/json',
      }
    };

    console.log('cookies:',cookies);
    console.log(cookies.authToken);

    try {
      const response = await fetch(endpoint, options);
      const data = await response.json();
      //console.log(data.bearing);

      if (data.bearing){
        
        var b=[]
        for(var i=0;i<data.bearing.length;i++){
          b.push(String(data.bearing[i])+" ")
        }
        setBearingList(data.bearing);
        setBearingListShow(b);
        setbranching(1);


      }

      if (branching === 0) {
        //setbranching(1);
        setPrompted(false); // Reset prompted state
      }


      // if (!prompted && branching === 1)
      // {
      //   console.log(bearingList);
      //   const userChoice = window.confirm(`Service road is available. do you want to swtich? current bearing: ${bearingList[1]} service road bearing: ${bearingList[0]}`);
      //   if (userChoice) {
      //     //bearingNum = (bearingList[0]);
      //     setBearingNum(bearingList[0]);
      //     console.log(bearingNum)

      //     setBearing(bearingNum); // Update bearing to service road
      //     console.log(data);
          
      //     setPrompted(true);
      //   }
      //   //fetchCoordinates();
      // }

      setViewport((prevViewport) => ({
        ...prevViewport,
        latitude: data.latitude,
        longitude: data.longitude,
        zoom: viewport.zoom,
      }));

      // if (data.bearing){
      //   const serviceRoadBearing = data.bearing[1];

      //   const userChoice = window.confirm(`A service road is available. Do you want to switch to it? (Current Bearing: ${bearing}, Service Road Bearing: ${serviceRoadBearing})`);

      //   if (userChoice) {
      //     setBearing(serviceRoadBearing);
      //   } else {
      //     setBearing(data.bearing[0]);
      //   }
      // }

      // Check if TollBoothLoc is present in the response
      if (data.TollBoothLoc) {
        setTollBooth(data.TollBoothLoc);
      } else {
        setTollBooth(null);
      }

    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  const handleUpdateCoordinates = () => {
    setViewport((prevViewport) => ({
      ...prevViewport,
      latitude: parseFloat(latInput),
      longitude: parseFloat(longInput),
    }));
  };
  const handleBearingSelectionPopup = () => {
    const popupContainer = document.createElement("div");
    popupContainer.className = "popup-container"; // Apply the CSS class
  
    const selectElement = document.createElement("select");
  
    bearingList.forEach((bearing, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.text = `Bearing ${index + 1}: ${bearing}`;
      selectElement.appendChild(option);
    });
  
    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirm";
    confirmButton.onclick = () => {
      const selectedIndex = selectElement.selectedIndex;
      if (selectedIndex >= 0) {
        setBearingNum(selectedIndex);
        setBearing(bearingList[selectedIndex]);
      }
      document.body.removeChild(popupContainer);
    };
  
    popupContainer.appendChild(selectElement);
    popupContainer.appendChild(confirmButton);
    document.body.appendChild(popupContainer);
  };
  

  const handleBearingChange = () => {
    setBearing(bearingList[bearingNum])
  }

  useEffect(() => {
    const intervalId = setInterval(fetchCoordinates, 5000);
    return () => clearInterval(intervalId);
  }, [viewport, bearing, cookies.authToken]); // Include authToken in the dependency array

  return (
    <div className="App">
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "5px",
          zIndex: 1,
        }}
      >
        <div>
          <label>
            Enter Latitude:
            <input
              type="number"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
            />
          </label>
          
          <label>
            Enter Longitude:
            <input
              type="number"
              value={longInput}
              onChange={(e) => setLongInput(e.target.value)}
            />
          </label>

          

          <button onClick={handleUpdateCoordinates}>Update</button>

          {/* <label>
            Select Bearing:
            {bearingListShow}
            <input
              type="number"
              value={bearingNum}
              onChange={(e) => setBearingNum(e.target.value)}
            />
          </label> */}

          <label>
            Select Bearing:
            <button onClick={handleBearingSelectionPopup}>
              Choose Bearing
            </button>
            {bearingNum !== null && <span>Selected: Bearing {parseInt(bearingNum) + 1}: {bearingList[bearingNum]}</span>}
          </label>



          <button onClick={handleBearingChange}>Update Bearing</button>
        </div>
        <div>Latitude: {viewport.latitude}</div>
        <div>Longitude: {viewport.longitude}</div>
        <div>Zoom: {viewport.zoom}</div>
      </div>
      <Map
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        style={{
          width: viewport.width,
          height: viewport.height,
        }}
        initialViewState={{
          longitude: viewport.longitude,
          latitude: viewport.latitude,
          zoom: viewport.zoom,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >  
        <Marker longitude={viewport.longitude} latitude={viewport.latitude} />
        {tollBooth && (
            <Marker longitude={tollBooth.longitude} latitude={tollBooth.latitude}>              
                <Popup
                  longitude={tollBooth.longitude}
                  latitude={tollBooth.latitude}
                  closeButton={true}
                  closeOnClick={false}
                  anchor="center"
                  >
                  <img style={{width: 'auto',
                               height: '50px'}}
                    src={tollboothimg} // Replace with your image path or URL
                    alt="Toll Booth"
                  />
                </Popup>
            </Marker>     
        )}
        <NavigationControl position="bottom-right" />
        <FullscreenControl />
        <GeolocateControl />
      </Map>
    </div>
  );
}
