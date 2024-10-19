import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
})

// Custom hook to update map view
function ChangeView({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom])
  return null
}

// Function to calculate distance between two points
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Simulated incident data
const incidentData = [
  { id: 1, position: [51.505, -0.09], type: 'crime' },
  { id: 2, position: [51.51, -0.1], type: 'disaster' },
  { id: 3, position: [51.49, -0.08], type: 'crime' },
  { id: 4, position: [51.5, -0.05], type: 'crime' },
  { id: 5, position: [51.52, -0.12], type: 'disaster' },
  { id: 6, position: [51.515, -0.095], type: 'crime' },
  { id: 7, position: [51.508, -0.11], type: 'crime' },
  { id: 8, position: [51.498, -0.087], type: 'disaster' },
  { id: 9, position: [51.503, -0.06], type: 'crime' },
  { id: 10, position: [51.51, -0.085], type: 'crime' },
]

const MapComponent = ({ searchLocation, onSearchComplete }) => {
  const [mapCenter, setMapCenter] = useState([51.505, -0.09])
  const [mapZoom, setMapZoom] = useState(13)
  const [searchMarker, setSearchMarker] = useState(null)
  const [clusters, setClusters] = useState([])
  const mapRef = useRef()

  useEffect(() => {
    if (searchLocation) {
      fetchLocation(searchLocation)
    }
  }, [searchLocation])

  useEffect(() => {
    // Cluster incidents
    const newClusters = []
    incidentData.forEach(incident => {
      const existingCluster = newClusters.find(cluster => 
        getDistance(cluster.position[0], cluster.position[1], incident.position[0], incident.position[1]) <= 5
      )
      if (existingCluster) {
        existingCluster.incidents.push(incident)
      } else {
        newClusters.push({
          position: incident.position,
          incidents: [incident]
        })
      }
    })
    setClusters(newClusters)
  }, [])

  // Fetch location data from OpenStreetMap API
  const fetchLocation = async (query) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setMapCenter([parseFloat(lat), parseFloat(lon)])
        setMapZoom(12)
        setSearchMarker([parseFloat(lat), parseFloat(lon)])
        onSearchComplete({ success: true, message: 'Location found' })
      } else {
        onSearchComplete({ success: false, message: 'Location not found' })
      }
    } catch (error) {
      console.error('Error fetching location:', error)
      onSearchComplete({ success: false, message: 'Error searching for location' })
    }
  }

  // Calculate color based on number of incidents
  const getColor = (incidents) => {
    const opacity = Math.min(0.2 + (incidents.length / 10) * 0.8, 1)
    return `rgba(255, 0, 0, ${opacity})`
  }

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={mapZoom} 
      style={{ height: '100%', width: '100%' }}
      className="z-0 rounded-lg shadow-2xl"
      ref={mapRef}
    >
      <ChangeView center={mapCenter} zoom={mapZoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {clusters.map((cluster, index) => (
        <CircleMarker
          key={index}
          center={cluster.position}
          radius={Math.sqrt(cluster.incidents.length) * 5}
          fillColor={getColor(cluster.incidents)}
          color="red"
          weight={2}
          opacity={0.8}
          fillOpacity={0.8}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold text-lg mb-2">Risk Zone</h3>
              <p className="text-red-600 font-semibold">Incidents: {cluster.incidents.length}</p>
              <ul className="mt-2">
                {cluster.incidents.map((incident, i) => (
                  <li key={i} className="text-sm">
                    {incident.type === 'crime' ? '🚨' : '🌪️'} {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </CircleMarker>
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
              <h3 className="font-bold text-lg mb-2">Searched Location</h3>
              <p className="text-blue-600">Lat: {searchMarker[0].toFixed(4)}, Lon: {searchMarker[1].toFixed(4)}</p>
            </div>
          </Popup>
        </CircleMarker>
      )}
    </MapContainer>
  )
}

export default MapComponent