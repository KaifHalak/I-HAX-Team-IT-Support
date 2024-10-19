import React from 'react'
import { AlertCircle, Clock, TrendingUp, Users } from 'lucide-react'

const RightPanel = ({ searchStatus }) => {
  return (
    <div className="w-80 bg-gray-800 p-6 rounded-2xl shadow-xl overflow-y-auto text-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <AlertCircle className="mr-2 text-red-400" />
        Risk Analysis
      </h2>
      
      {searchStatus && (
        <div className={`mb-6 p-3 rounded-lg ${searchStatus.success ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
          {searchStatus.message}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <TrendingUp className="mr-2 text-blue-400" />
            Current Risk Level
          </h3>
          <div className="text-3xl font-bold text-red-400">High</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Clock className="mr-2 text-blue-400" />
            Last Updated
          </h3>
          <div className="text-gray-300">2 minutes ago</div>
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Users className="mr-2 text-blue-400" />
            Affected Population
          </h3>
          <div className="text-gray-300">Approximately 50,000</div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Incidents</h3>
        <ul className="space-y-3">
          <li className="bg-red-900 text-red-200 p-3 rounded-lg">Armed robbery reported on Main St.</li>
          <li className="bg-yellow-900 text-yellow-200 p-3 rounded-lg">Flash flood warning in Downtown area</li>
          <li className="bg-orange-900 text-orange-200 p-3 rounded-lg">Heatwave alert for the next 48 hours</li>
        </ul>
      </div>
    </div>
  )
}

export default RightPanel