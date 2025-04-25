import React, { useEffect, useState } from 'react';
import { Circle, Move, RotateCcw } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';

const RobotArmSimulation: React.FC = () => {
  const { recentClassifications } = useWasteData();
  const [currentAction, setCurrentAction] = useState<string>('Idle');
  const [actionLog, setActionLog] = useState<string[]>([
    'System initialized',
    'Waiting for waste...'
  ]);
  const [robotPosition, setRobotPosition] = useState<number>(50);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (recentClassifications.length > 0) {
      const latestClassification = recentClassifications[0];
      processWaste(latestClassification.category, latestClassification.wasteType);
    }
  }, [recentClassifications]);

  const processWaste = (category: string, wasteType: string) => {
    setIsAnimating(true);
    
    // Determine target position based on waste category
    let targetPosition = 50;
    let actionDescription = '';
    
    switch(category.toLowerCase()) {
      case 'recyclable':
        targetPosition = 20;
        actionDescription = `Moving ${wasteType} to recycling bin`;
        setActionLog(prev => [
          `Detected: ${wasteType} (Recyclable)`,
          'Activating sorting mechanism',
          `Moving arm to recycling container`,
          `Depositing item in blue recycling bin`,
          'Returning to scanning position',
          ...prev.slice(0, 5)
        ]);
        break;
      case 'biodegradable':
        targetPosition = 50;
        actionDescription = `Moving ${wasteType} to compost bin`;
        setActionLog(prev => [
          `Detected: ${wasteType} (Biodegradable)`,
          'Activating sorting mechanism',
          `Moving arm to composting container`,
          `Depositing item in green compost bin`,
          'Returning to scanning position',
          ...prev.slice(0, 5)
        ]);
        break;
      case 'non-recyclable':
        targetPosition = 80;
        actionDescription = `Moving ${wasteType} to waste bin`;
        setActionLog(prev => [
          `Detected: ${wasteType} (Non-recyclable)`,
          'Activating sorting mechanism',
          `Moving arm to general waste container`,
          `Depositing item in red waste bin`,
          'Returning to scanning position',
          ...prev.slice(0, 5)
        ]);
        break;
      default:
        targetPosition = 65;
        actionDescription = `Processing unknown waste type: ${wasteType}`;
        setActionLog(prev => [
          `Detected: Unknown waste type`,
          'Activating sorting mechanism',
          `Moving to general waste as precaution`,
          `Depositing in general waste bin`,
          'Returning to scanning position',
          ...prev.slice(0, 5)
        ]);
    }
    
    setCurrentAction(actionDescription);
    
    // Animate robot position
    const startPosition = robotPosition;
    const distance = targetPosition - startPosition;
    let start: number | null = null;
    const duration = 1000; // ms
    
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      setRobotPosition(startPosition + distance * progress);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        // Animation completed
        setTimeout(() => {
          setRobotPosition(50); // Return to center
          setCurrentAction('Idle');
          setIsAnimating(false);
        }, 1000);
      }
    };
    
    window.requestAnimationFrame(step);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Robot Arm Simulation</h2>
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isAnimating ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-xs text-gray-500">{isAnimating ? 'Active' : 'Standby'}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="relative h-10 mb-6 bg-gray-100 rounded-lg overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 w-1/3 border-r-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <Circle size={8} className="text-blue-500 fill-blue-500" />
              <span className="text-xs text-gray-500">Recyclable</span>
            </div>
          </div>
          <div className="absolute top-0 bottom-0 left-1/3 right-1/3 border-r-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <Circle size={8} className="text-green-500 fill-green-500" />
              <span className="text-xs text-gray-500">Biodegradable</span>
            </div>
          </div>
          <div className="absolute top-0 bottom-0 right-0 w-1/3 flex items-center justify-center">
            <div className="flex items-center space-x-1">
              <Circle size={8} className="text-red-500 fill-red-500" />
              <span className="text-xs text-gray-500">Non-recyclable</span>
            </div>
          </div>
          
          <div 
            className="absolute top-0 w-6 h-10 flex items-center justify-center transition-all duration-300"
            style={{ left: `calc(${robotPosition}% - 12px)` }}
          >
            <Move 
              size={24} 
              className={`text-gray-700 ${isAnimating ? 'animate-pulse' : ''}`} 
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <span className="text-xs font-medium text-gray-700 mr-2">Current Action:</span>
            <span className={`text-xs ${isAnimating ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              {currentAction}
            </span>
          </div>
        </div>
        
        <div className="h-32 bg-black rounded-md p-2 font-mono text-xs text-green-400 overflow-y-auto">
          {actionLog.map((log, index) => (
            <div key={index} className="leading-tight">
              {`> ${log}`}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center justify-end">
          <button 
            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
            onClick={() => {
              setActionLog(['System restarted', 'Waiting for waste...']);
              setCurrentAction('Idle');
              setRobotPosition(50);
              setIsAnimating(false);
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RobotArmSimulation;