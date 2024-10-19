import React, { useState } from 'react'
import { Search, Filter, AlertTriangle, Loader, MapPin, BarChart2 } from 'lucide-react'

const Sidebar = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setSearchError(null)
    try {
      await onSearch(searchInput)
    } catch (error) {
      setSearchError('An error occurred while searching. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-6 text-white shadow-2xl bg-gradient-to-b from-gray-900 to-gray-800 w-72 rounded-r-2xl">
      <h1 className="flex items-center mb-8 text-3xl font-bold">
        <MapPin className="mr-2 text-red-500" />
        Risk Zone Monitor
      </h1>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search location..."
            className="w-full p-3 pl-10 text-white transition duration-300 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        <button 
          type="submit" 
          className="flex items-center justify-center w-full p-3 mt-4 text-white transition duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? <Loader className="mr-2 animate-spin" size={18} /> : 'Search'}
        </button>
      </form>
      {searchError && (
        <div className="p-3 mb-6 text-white bg-red-600 rounded-lg animate-pulse">
          {searchError}
        </div>
      )}
      <div className="mb-8">
        <h2 className="flex items-center mb-4 text-xl font-semibold">
          <Filter size={20} className="mr-2 text-blue-400" /> Filters
        </h2>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 text-blue-500 rounded form-checkbox focus:ring-blue-500" checked />
            <span className="text-gray-300 transition duration-300 hover:text-white">Crime Zones</span>
          </label>
          {/* <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 text-blue-500 rounded form-checkbox focus:ring-blue-500" />
            <span className="text-gray-300 transition duration-300 hover:text-white">Natural Disasters</span>
          </label> */}
        </div>
      </div>
      <div className="mt-auto">
        <h2 className="flex items-center mb-4 text-xl font-semibold">
          <AlertTriangle size={20} className="mr-2 text-yellow-500" /> Active Alerts
        </h2>
        <ul className="space-y-3">
          <li className="flex items-center p-3 transition duration-300 bg-red-900 rounded-lg hover:bg-red-800">
            <BarChart2 size={18} className="mr-2" />
            <span>High risk in Central London</span>
          </li>
          <li className="flex items-center p-3 transition duration-300 bg-yellow-900 rounded-lg hover:bg-yellow-800">
            <BarChart2 size={18} className="mr-2" />
            <span>Medium risk in East End</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar