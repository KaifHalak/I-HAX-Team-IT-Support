import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

// Custom hook to update map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

// Simulated crime data (replace with real data in production)
const crimeData = [
  { id: 1, position: [3.1390, 101.6869], incidents: 50, type: 'Theft' },
  { id: 2, position: [3.1450, 101.6950], incidents: 30, type: 'Assault' },
  { id: 3, position: [3.1330, 101.6800], incidents: 80, type: 'Burglary' },
  { id: 4, position: [3.1410, 101.6920], incidents: 20, type: 'Vandalism' },
  { id: 5, position: [3.1370, 101.6830], incidents: 60, type: 'Robbery' },
];

const MapComponent = ({ searchLocation, onSearchComplete, setSpinner, setRiskLevel }) => {
  const [mapCenter, setMapCenter] = useState([3.1390, 101.6869]); // Kuala Lumpur coordinates
  const [mapZoom, setMapZoom] = useState(13);
  const [searchMarker, setSearchMarker] = useState(null);
  const [crimeData, setCrimeData] = useState(null)
  const [showCrimes, setShowCrimes] = useState(false);
  const [policeStations, setPoliceStations] = useState([]);
  const mapRef = useRef();


  useEffect(() => {
    const fetchData = async () => {
      if (searchLocation) {
        console.log("ENTER USE EFFECT");
        setSpinner("")
        await fetchCrimeData(searchLocation); // Await fetch operation
        setSpinner("hidden")
        fetchLocation(searchLocation);
      }
    };
  
    fetchData(); // Call the async function
  
  }, [searchLocation]); // Dependency array
  

  // Fetch location data from OpenStreetMap API
  const fetchLocation = async (query) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setMapZoom(14);
        setSearchMarker(newCenter);
        setShowCrimes(false);
        setTimeout(() => setShowCrimes(true), 1000); // Delay to allow animation
        fetchPoliceStations(newCenter);
        onSearchComplete({ success: true, message: 'Location found' });
      } else {
        onSearchComplete({ success: false, message: 'Location not found' });
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      onSearchComplete({ success: false, message: 'Error searching for location' });
    }
  };


  const fetchCrimeData = async (query) => {
    try {
      const response = await fetch(`http://localhost:3000/api/data?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log("JSON FROM SERVER")
      console.log(data)


      if (data.length <= 1){
        setRiskLevel("Low")
      } else if (data.length <= 3){
        setRiskLevel("Medium")
      } else if (data.length > 3){
        setRiskLevel("High")
      }

    

      if (data && data.length > 0) {
        console.log("RECIEVED DATA: ")
        console.log(data)
        setCrimeData(() => {return data})
      } else {
        onSearchComplete({ success: false, message: 'Location not found' });
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      onSearchComplete({ success: false, message: 'Error searching for location' });
    }
  };

  // Fetch police stations using Overpass API
  const fetchPoliceStations = async (center) => {
    const [lat, lon] = center;
    const radius = 5000; // 5km radius
    const query = `
      [out:json];
      (
        node["amenity"="police"](around:${radius},${lat},${lon});
        way["amenity"="police"](around:${radius},${lat},${lon});
        relation["amenity"="police"](around:${radius},${lat},${lon});
      );
      out center;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      const stations = data.elements.map((element, index) => ({
        id: element.id,
        position: element.lat && element.lon ? [element.lat, element.lon] : [element.center.lat, element.center.lon],
        name: element.tags.name || `Police Station ${index + 1}`
      }));
      setPoliceStations(stations);
    } catch (error) {
      console.error('Error fetching police stations:', error);
    }
  };

  // Calculate color based on number of incidents
  const getColor = (incidents) => {
    if (incidents <= 1) return 'yellow';
    if (incidents <= 2) return 'orange';
    if (incidents > 3) return 'red';
    return 'red';
  };

  return ( <MapContainer 
    center={mapCenter} 
    zoom={mapZoom} 
    style={{ height: '100%', width: '100%' }}
    className="rounded-lg shadow-2xl z-[99999]"
    ref={mapRef}
  >
    <ChangeView center={mapCenter} zoom={mapZoom} />
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    
    {/* 5km radius circle */}
    {searchMarker && (
      <Circle
        center={searchMarker}
        radius={5000}
        fillColor="#000"
        fillOpacity={0.05}
        color="#000"
        weight={2}
      />
    )}

    {/* Central blue circle */}
    {searchMarker && (
      <CircleMarker
        center={searchMarker}
        radius={15}
        fillColor="#3388ff"
        color="#3388ff"
        weight={2}
        opacity={1}
        fillOpacity={0.5}
      />
    )}

    {/* Crime markers */}
    {showCrimes && crimeData && crimeData.map((crime, index) => (
      <CircleMarker
        key={index}
        center={[crime.coordinates.lat, crime.coordinates.lng]}
        radius={10}
        fillColor={getColor(crime.instances)}
        color={getColor(crime.instances)}
        weight={2}
        opacity={0.8}
        fillOpacity={0.8}
      >
        <Popup>
          <div className="text-center">
            {crime.tags.map((tag, index) => (
              <h3 key={index} className="mb-2 text-lg font-bold">{tag}</h3>
            ))}
            <p className="font-semibold text-red-600">Incidents: {crime.instances}</p>
          </div>
        </Popup>
      </CircleMarker>
    ))}

    {/* Police station markers */}
    {policeStations.map((station) => (
      <CircleMarker
        key={station.id}
        center={station.position}
        radius={8}
        fillColor="#00ff00"
        color="#006400"
        weight={2}
        opacity={1}
        fillOpacity={0.8}
      >
        <Popup>
          <div className="text-center">
            <h3 className="mb-2 text-lg font-bold">{station.name}</h3>
            <p className="text-green-600">Police Station</p>
          </div>
        </Popup>
      </CircleMarker>
    ))}

    {/* Search marker */}
    {searchMarker && (
      <CircleMarker
        center={searchMarker}
        radius={8}
        fillColor="#4a90e2"
        color="#2c3e50"
        weight={2}
        opacity={1}
        fillOpacity={0.8}
      >
        <Popup>
          <div className="text-center">
            <h3 className="mb-2 text-lg font-bold">Searched Location</h3>
            <p className="text-blue-600">Lat: {searchMarker[0].toFixed(4)}, Lon: {searchMarker[1].toFixed(4)}</p>
          </div>
        </Popup>
      </CircleMarker>
    )}
  </MapContainer>
    

  );
};

export default MapComponent;