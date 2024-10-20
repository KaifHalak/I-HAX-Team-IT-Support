import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MapComponent from './components/MapComponent'
import RightPanel from './components/RightPanel'

import "./spinner.css"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchLocation, setSearchLocation] = useState('')
  const [searchStatus, setSearchStatus] = useState(null)
  const [spinner, setSpinner] = useState("hidden")
  const [riskLevel, setRiskLevel] = useState("null")

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleSearch = (location) => {
    return new Promise((resolve, reject) => {
      setSearchLocation(location)
      setSearchStatus(null)
      // Simulating a delay to show loading state
      // setTimeout(() => {
      //   resolve()
      // },5000)
      resolve()
  
    })
  }

  const handleSearchComplete = (status) => {
    setSearchStatus(status)
  }

  

  return (
    <>
      <Helmet>
        <title>GeoGuard - Real-time Crime and Disaster Tracking</title>
        <meta name="description" content="Monitor and assess dangerous areas in real-time with our AI-powered map interface. Track crime zones and natural disasters globally." />
        <meta name="keywords" content="risk zone, crime map, disaster tracking, real-time monitoring, global safety" />
        <meta name="author" content="Your Company Name" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://yourdomain.com/risk-zone-monitor" />
      </Helmet>
      <div className="flex h-screen overflow-hidden text-gray-800 bg-gray-100">
        {sidebarOpen && <Sidebar onSearch={handleSearch} />}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />
          <div className="flex flex-1 p-4 overflow-hidden">
            <main className="relative flex-1 mr-4 overflow-y-auto bg-white shadow-xl rounded-2xl">
              <MapComponent searchLocation={searchLocation} onSearchComplete={handleSearchComplete} setSpinner={setSpinner} setRiskLevel={setRiskLevel} />
            </main>
            <RightPanel searchStatus={searchStatus} riskLevel={riskLevel} />
          </div>
        </div>

        <div className={'absolute top-0 left-0 w-full h-full bg-black/40 z-[99999] flex justify-center items-center ' + spinner}>
        
            <div className='spinner'></div>
        </div>
      </div>
    </>
  )
}

export default App