import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  Circle,
  Marker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

// Define police badge icon
const policeBadgeIcon = new L.Icon({
  iconUrl: "/Police_Badge.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
}

const MapComponent = ({
  searchLocation,
  onSearchComplete,
  setSpinner,
  setRiskLevel,
}) => {
  const [mapCenter, setMapCenter] = useState([3.139, 101.6869]); // Kuala Lumpur coordinates
  const [mapZoom, setMapZoom] = useState(13);
  const [searchMarker, setSearchMarker] = useState(null);
  const [crimeData, setCrimeData] = useState(null);
  const [showCrimes, setShowCrimes] = useState(false);
  const [policeStations, setPoliceStations] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      if (searchLocation) {
        setSpinner("");
        await fetchCrimeData(searchLocation);
        setSpinner("hidden");
        await fetchLocation(searchLocation);
      }
    };
    fetchData();
  }, [searchLocation]);

  const fetchLocation = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
        setMapZoom(14);
        setSearchMarker(newCenter);
        setShowCrimes(false);
        setTimeout(() => setShowCrimes(true), 1000);
        await fetchPoliceStations(newCenter);
        onSearchComplete({ success: true, message: "Location found" });
      } else {
        onSearchComplete({ success: false, message: "Location not found" });
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      onSearchComplete({
        success: false,
        message: "Error searching for location",
      });
    }
  };

  const fetchCrimeData = async (query) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/data?q=${encodeURIComponent(query)}`
      );
      console.log(response)
      const data = await response.json();

      if (data.length <= 1) {
        setRiskLevel("Low");
      } else if (data.length <= 3) {
        setRiskLevel("Medium");
      } else if (data.length > 3) {
        setRiskLevel("High");
      }

      if (data && data.length > 0) {
        setCrimeData(data);
      } else {
        onSearchComplete({ success: false, message: "Location not found" });
      }
    } catch (error) {
      console.error("Error fetching crime data:", error);
      onSearchComplete({
        success: false,
        message: "Error fetching crime data",
      });
    }
  };

  const fetchPoliceStations = async (center) => {
    const [lat, lon] = center;
    const radius = 0.1; // Approximately 10km radius
    const query = `
      [out:json];
      (
        node["amenity"="police"](${lat - radius},${lon - radius},${
      lat + radius
    },${lon + radius});
        way["amenity"="police"](${lat - radius},${lon - radius},${
      lat + radius
    },${lon + radius});
        relation["amenity"="police"](${lat - radius},${lon - radius},${
      lat + radius
    },${lon + radius});
      );
      out center;
    `;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });
      const data = await response.json();
      const stations = data.elements.map((element, index) => ({
        id: element.id,
        position:
          element.lat && element.lon
            ? [element.lat, element.lon]
            : [element.center.lat, element.center.lon],
        name: element.tags.name || `Police Station ${index + 1}`,
      }));
      setPoliceStations(stations);
    } catch (error) {
      console.error("Error fetching police stations:", error);
    }
  };

  const getColor = (incidents) => {
    if (incidents <= 1) return "rgba(255, 255, 0, 0.6)"; // Stronger yellow
    if (incidents <= 2) return "rgba(255, 165, 0, 0.6)"; // Stronger orange
    return "rgba(255, 0, 0, 0.6)"; // Stronger red
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg shadow-2xl z-[99999]"
      ref={mapRef}
    >
      <ChangeView center={mapCenter} zoom={mapZoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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

      {showCrimes &&
        crimeData &&
        crimeData.map((crime, index) => (
          <Circle
            key={index}
            center={[crime.coordinates.lat, crime.coordinates.lng]}
            radius={5000}
            fillColor={getColor(crime.instances)}
            color={getColor(crime.instances)}
            weight={1}
            opacity={0.8}
            fillOpacity={0.4}
          >
            <Popup>
              <div className="text-center">
                {crime.tags.map((tag, index) => (
                  <h3 key={index} className="mb-2 text-lg font-bold">
                    {tag}
                  </h3>
                ))}
                <p className="font-semibold text-red-600">
                  Incidents: {crime.instances}
                </p>
              </div>
            </Popup>
          </Circle>
        ))}

      {policeStations.map((station) => (
        <Marker
          key={station.id}
          position={station.position}
          icon={policeBadgeIcon}
        >
          <Popup>
            <div className="text-center">
              <h3 className="mb-2 text-lg font-bold">{station.name}</h3>
              <p className="text-green-600">Police Station</p>
            </div>
          </Popup>
        </Marker>
      ))}

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
              <p className="text-blue-600">
                Lat: {searchMarker[0].toFixed(4)}, Lon:{" "}
                {searchMarker[1].toFixed(4)}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
};

export default MapComponent;
