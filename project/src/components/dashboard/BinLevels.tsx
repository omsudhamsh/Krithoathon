import React from 'react';
import { useWasteData } from '../../context/WasteDataContext';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';

const BinLevels: React.FC = () => {
  const { binLevels, refreshSystemStatus } = useWasteData();

  const getBinColor = (level: number) => {
    if (level < 50) return { text: 'text-green-600', bg: 'bg-green-500' };
    if (level < 80) return { text: 'text-yellow-600', bg: 'bg-yellow-500' };
    return { text: 'text-red-600', bg: 'bg-red-500' };
  };

  const getStatusMessage = (level: number) => {
    if (level < 50) return 'Normal';
    if (level < 80) return 'Filling up';
    return 'Needs emptying';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center">
          <Trash2 size={18} className="text-gray-700 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Waste Bin Levels</h2>
        </div>
        <button 
          onClick={refreshSystemStatus} 
          className="p-1 rounded text-gray-500 hover:bg-gray-100"
          title="Refresh bin levels"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="p-4 grid grid-cols-1 gap-4">
        {/* Recyclable Bin */}
        <div className="p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <h3 className="text-sm font-medium text-gray-700">Recyclable Waste</h3>
            </div>
            <span className={`text-sm ${getBinColor(binLevels.recyclable).text}`}>
              {binLevels.recyclable}% full
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${getBinColor(binLevels.recyclable).bg} h-2.5 rounded-full`} 
              style={{ width: `${binLevels.recyclable}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-xs text-gray-500">
              Status: {getStatusMessage(binLevels.recyclable)}
            </span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
        </div>
        
        {/* Biodegradable Bin */}
        <div className="p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <h3 className="text-sm font-medium text-gray-700">Biodegradable Waste</h3>
            </div>
            <span className={`text-sm ${getBinColor(binLevels.biodegradable).text}`}>
              {binLevels.biodegradable}% full
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${getBinColor(binLevels.biodegradable).bg} h-2.5 rounded-full`} 
              style={{ width: `${binLevels.biodegradable}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-xs text-gray-500">
              Status: {getStatusMessage(binLevels.biodegradable)}
            </span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
        </div>
        
        {/* Non-recyclable Bin */}
        <div className="p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <h3 className="text-sm font-medium text-gray-700">Non-recyclable Waste</h3>
            </div>
            <span className={`text-sm ${getBinColor(binLevels.nonRecyclable).text}`}>
              {binLevels.nonRecyclable}% full
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${getBinColor(binLevels.nonRecyclable).bg} h-2.5 rounded-full`} 
              style={{ width: `${binLevels.nonRecyclable}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-xs text-gray-500">
              Status: {getStatusMessage(binLevels.nonRecyclable)}
            </span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
        </div>
        
        {/* Hazardous Bin */}
        <div className="p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <h3 className="text-sm font-medium text-gray-700">Hazardous Waste</h3>
            </div>
            <span className={`text-sm ${getBinColor(binLevels.hazardous).text}`}>
              {binLevels.hazardous}% full
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${getBinColor(binLevels.hazardous).bg} h-2.5 rounded-full`} 
              style={{ width: `${binLevels.hazardous}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-xs text-gray-500">
              Status: {getStatusMessage(binLevels.hazardous)}
            </span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-3 flex items-center text-xs text-gray-500">
        <AlertCircle size={14} className="mr-1 text-yellow-500" />
        <span>Bins over 80% capacity should be emptied soon.</span>
      </div>
    </div>
  );
};

export default BinLevels; 