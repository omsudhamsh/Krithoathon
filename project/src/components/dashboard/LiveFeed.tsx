import React from 'react';
import { Activity, FileImage, Clock, Trash, Recycle, Leaf } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';

const LiveFeed: React.FC = () => {
  const { liveFeed } = useWasteData();
  
  const getBucketColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recyclable':
        return 'bg-blue-500';
      case 'biodegradable':
        return 'bg-green-500';
      case 'non-recyclable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getBucketIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'recyclable':
        return <Recycle size={14} className="text-white" />;
      case 'biodegradable':
        return <Leaf size={14} className="text-white" />;
      case 'non-recyclable':
        return <Trash size={14} className="text-white" />;
      default:
        return <Trash size={14} className="text-white" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Live Classification Feed</h2>
        <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
          <Activity size={14} />
          <span>Live</span>
        </div>
      </div>
      
      <div className="p-4">
        <ul className="divide-y divide-gray-100">
          {liveFeed.length === 0 ? (
            <li className="py-3 text-center text-gray-500 text-sm">
              No classifications yet
            </li>
          ) : (
            liveFeed.map((item) => (
              <li key={item.id} className="py-3 flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {item.imageUrl ? (
                    <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.category} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <FileImage size={18} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.wasteType}
                    </p>
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getBucketColor(item.category)}`}>
                        {getBucketIcon(item.category)}
                      </div>
                      <span className="ml-1 text-xs font-medium text-gray-500">
                        {Math.round(item.accuracy)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock size={12} className="mr-1" />
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
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