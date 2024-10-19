import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MapComponent from './components/MapComponent'
import RightPanel from './components/RightPanel'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchLocation, setSearchLocation] = useState('')
  const [searchStatus, setSearchStatus] = useState(null)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleSearch = (location) => {
    return new Promise((resolve, reject) => {
      setSearchLocation(location)
      setSearchStatus(null)
      // Simulating a delay to show loading state
      setTimeout(() => {
        resolve()
      }, 1000)
    })
  }

  const handleSearchComplete = (status) => {
    setSearchStatus(status)
  }

  return (
    <>
      <Helmet>
        <title>Risk Zone Monitor - Real-time Crime and Disaster Tracking</title>
        <meta name="description" content="Monitor and assess dangerous areas in real-time with our AI-powered map interface. Track crime zones and natural disasters globally." />
        <meta name="keywords" content="risk zone, crime map, disaster tracking, real-time monitoring, global safety" />
        <meta name="author" content="Your Company Name" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://yourdomain.com/risk-zone-monitor" />
      </Helmet>
      <div className="flex h-screen bg-gray-100 text-gray-800 overflow-hidden">
        {sidebarOpen && <Sidebar onSearch={handleSearch} />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex overflow-hidden p-4">
            <main className="flex-1 overflow-y-auto relative bg-white rounded-2xl shadow-xl mr-4">
              <MapComponent searchLocation={searchLocation} onSearchComplete={handleSearchComplete} />
            </main>
            <RightPanel searchStatus={searchStatus} />
          </div>
        </div>
      </div>
    </>
  )
}

export default App