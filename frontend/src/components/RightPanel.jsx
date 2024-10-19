import React from 'react'
import { AlertCircle, Clock, TrendingUp, Users } from 'lucide-react'

const RightPanel = ({ searchStatus, riskLevel }) => {
  return (
    <div className="p-6 overflow-y-auto text-gray-200 bg-gray-800 shadow-xl w-80 rounded-2xl">
      <h2 className="flex items-center mb-6 text-2xl font-bold">
        <AlertCircle className="mr-2 text-red-400" />
        Risk Analysis
      </h2>
      
      {searchStatus && (
        <div className={`mb-6 p-3 rounded-lg ${searchStatus.success ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
          {searchStatus.message}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="p-4 bg-gray-700 rounded-lg">
          <h3 className="flex items-center mb-2 text-lg font-semibold">
            <TrendingUp className="mr-2 text-blue-400" />
            Current Risk Level
          </h3>
          <div className="text-3xl font-bold text-red-400">{riskLevel}</div>
        </div>
        
        <div className="p-4 bg-gray-700 rounded-lg">
          <h3 className="flex items-center mb-2 text-lg font-semibold">
            <Clock className="mr-2 text-blue-400" />
            Last Updated
          </h3>
          <div className="text-gray-300">2 minutes ago</div>
        </div>
        
        <div className="p-4 bg-gray-700 rounded-lg">
          <h3 className="flex items-center mb-2 text-lg font-semibold">
            <Users className="mr-2 text-blue-400" />
            Affected Population
          </h3>
          <div className="text-gray-300">Approximately 50,000</div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="mb-4 text-xl font-semibold">Recent Incidents</h3>
        <ul className="space-y-3">
          <li className="p-3 text-red-200 bg-red-900 rounded-lg">Armed robbery reported on Main St.</li>
          <li className="p-3 text-yellow-200 bg-yellow-900 rounded-lg">Flash flood warning in Downtown area</li>
          <li className="p-3 text-orange-200 bg-orange-900 rounded-lg">Heatwave alert for the next 48 hours</li>
        </ul>
      </div>
    </div>
  )
}

export default RightPanel