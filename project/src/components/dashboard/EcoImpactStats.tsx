import React from 'react';
import { useWasteData } from '../../context/WasteDataContext';
import { Leaf, Droplets, Zap, TreeDeciduous, BarChart3 } from 'lucide-react';

const EcoImpactStats: React.FC = () => {
  const { ecoImpact, stats } = useWasteData();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Environmental Impact</h2>
        <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
          <Leaf size={14} />
          <span>Positive Impact</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-3 bg-green-50 rounded-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <BarChart3 size={20} className="text-green-600" />
            </div>
            <p className="text-xs text-green-600 mb-1">Items Processed</p>
            <p className="text-lg font-semibold text-green-700">{stats.totalClassified}</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Leaf size={20} className="text-green-600" />
            </div>
            <p className="text-xs text-green-600 mb-1">CO₂ Saved</p>
            <p className="text-lg font-semibold text-green-700">{ecoImpact.co2Saved} kg</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Droplets size={20} className="text-green-600" />
            </div>
            <p className="text-xs text-green-600 mb-1">Water Saved</p>
            <p className="text-lg font-semibold text-green-700">{ecoImpact.waterSaved} L</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Zap size={20} className="text-green-600" />
            </div>
            <p className="text-xs text-green-600 mb-1">Energy Saved</p>
            <p className="text-lg font-semibold text-green-700">{ecoImpact.energySaved} kWh</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg flex flex-col items-center justify-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <TreeDeciduous size={20} className="text-green-600" />
            </div>
            <p className="text-xs text-green-600 mb-1">Tree Equivalent</p>
            <p className="text-lg font-semibold text-green-700">{ecoImpact.treesEquivalent}</p>
          </div>
        </div>
        
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">Impact Summary</p>
          <p>
            Your waste management has diverted {ecoImpact.landfillReduction} kg of waste from landfills, 
            equivalent to planting {ecoImpact.treesEquivalent} trees. Keep up the good work!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EcoImpactStats; 