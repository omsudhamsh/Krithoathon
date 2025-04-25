import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';

const RobotArmSimulation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const { recentClassifications } = useWasteData();
  
  // Simulation source - this would be a WebGL or video in a real implementation
  const simulationPlaceholder = "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg";
  
  // Simulate frames changing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % 100);
      }, 200);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Robot Arm Simulation</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded text-gray-500 hover:bg-gray-100"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button 
            onClick={() => setCurrentFrame(0)}
            className="p-1 rounded text-gray-500 hover:bg-gray-100"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
      
      <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
        <img 
          src={simulationPlaceholder} 
          alt="Robot Arm Simulation" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">Status:</span> {isPlaying ? 'Sorting in progress' : 'Paused'}
            </div>
            <div>
              <span className="font-medium">Frame:</span> {currentFrame}/100
            </div>
          </div>
          <div className="w-full bg-gray-700 h-1 mt-2 rounded-full">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-300" 
              style={{ width: `${currentFrame}%` }}
            ></div>
          </div>
        </div>
        
        {isPlaying && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full animate-pulse">
            Live
          </div>
        )}
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <p className="font-medium">Current Operation:</p>
        <p>
          {isPlaying 
            ? `Sorting ${recentClassifications.length > 0 ? recentClassifications[0].wasteType : 'plastic bottle'} to ${recentClassifications.length > 0 ? recentClassifications[0].category.toLowerCase() : 'recyclable'} bin`
            : 'Simulation paused. Press play to resume.'}
        </p>
      </div>
    </div>
  );
};

export default RobotArmSimulation;