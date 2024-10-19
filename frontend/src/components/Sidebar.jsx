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
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white w-72 p-6 flex flex-col h-full rounded-r-2xl shadow-2xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <MapPin className="mr-2 text-red-500" />
        Risk Zone Monitor
      </h1>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search location..."
            className="w-full bg-gray-700 text-white p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
        <button 
          type="submit" 
          className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? <Loader className="animate-spin mr-2" size={18} /> : 'Search'}
        </button>
      </form>
      {searchError && (
        <div className="mb-6 p-3 bg-red-600 text-white rounded-lg animate-pulse">
          {searchError}
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Filter size={20} className="mr-2 text-blue-400" /> Filters
        </h2>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="form-checkbox text-blue-500 rounded focus:ring-blue-500 h-5 w-5" />
            <span className="text-gray-300 hover:text-white transition duration-300">Crime Zones</span>
          </label>
          {/* <label className="flex items-center space-x-3 cursor-pointer">
            <input type="checkbox" className="form-checkbox text-blue-500 rounded focus:ring-blue-500 h-5 w-5" />
            <span className="text-gray-300 hover:text-white transition duration-300">Natural Disasters</span>
          </label> */}
        </div>
      </div>
      <div className="mt-auto">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <AlertTriangle size={20} className="mr-2 text-yellow-500" /> Active Alerts
        </h2>
        <ul className="space-y-3">
          <li className="bg-red-900 p-3 rounded-lg flex items-center transition duration-300 hover:bg-red-800">
            <BarChart2 size={18} className="mr-2" />
            <span>High risk in Central London</span>
          </li>
          <li className="bg-yellow-900 p-3 rounded-lg flex items-center transition duration-300 hover:bg-yellow-800">
            <BarChart2 size={18} className="mr-2" />
            <span>Medium risk in East End</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar