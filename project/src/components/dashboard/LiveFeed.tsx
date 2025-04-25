import React from 'react';
import { useWasteData } from '../../context/WasteDataContext';
import { ActivitySquare, FileImage } from 'lucide-react';

const LiveFeed: React.FC = () => {
  const { liveFeed } = useWasteData();

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recyclable':
        return 'bg-green-100 text-green-800';
      case 'biodegradable':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-recyclable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center">
          <ActivitySquare size={18} className="text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Live Classification Feed</h2>
        </div>
        <div className="flex items-center">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div className="overflow-y-auto max-h-96">
          {liveFeed.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No classifications yet. Upload an image to get started.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {liveFeed.map((item, index) => (
                <li 
                  key={item.id + index} 
                  className={`flex items-center p-4 ${index === 0 ? 'animate-pulse-once bg-blue-50' : ''}`}
                >
                  <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center mr-4 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="Waste" className="h-12 w-12 object-cover" />
                    ) : (
                      <FileImage size={20} className="text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.wasteType}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getCategoryColor(item.category)} mr-2`}>
                        {item.category}
                      </span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              item.accuracy > 90 
                                ? 'bg-green-500' 
                                : item.accuracy > 80 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                            }`} 
                            style={{ width: `${item.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{item.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-3">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Displaying {liveFeed.length} recent classifications</span>
          <span>Auto-refreshes every minute</span>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;

// Add this to your global CSS or as a styled component
const pulseOnceKeyframes = `
@keyframes pulseOnce {
  0%, 100% {
    background-color: rgba(239, 246, 255, 0.0);
  }
  50% {
    background-color: rgba(239, 246, 255, 1.0);
  }
}

.animate-pulse-once {
  animation: pulseOnce 2s ease-in-out 1;
}
`; 