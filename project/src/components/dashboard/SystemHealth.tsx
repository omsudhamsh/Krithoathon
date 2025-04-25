import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';
import { Progress } from '../ui/progress';

interface SystemComponentStatus {
  camera: string;
  robotArm: string;
  aiModel: string;
  conveyor: string;
  lastUpdated: string;
}

const SystemHealth: React.FC = () => {
  const { systemHealth, binLevels } = useWasteData();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'Warning':
        return <AlertTriangle className="text-amber-500" size={18} />;
      case 'Critical':
        return <XCircle className="text-red-500" size={18} />;
      default:
        return <CheckCircle className="text-gray-400" size={18} />;
    }
  };
  
  const getBinLevelColor = (level: number) => {
    if (level > 80) return 'bg-red-500';
    if (level > 60) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  const getBinStatusText = (level: number) => {
    if (level > 80) return 'Critical - Needs emptying';
    if (level > 60) return 'Warning - Getting full';
    return 'Good - Plenty of space';
  };

  // Mock component statuses if they don't exist in systemHealth
  const componentStatus: SystemComponentStatus = {
    camera: 'Healthy',
    robotArm: 'Healthy',
    aiModel: 'Healthy', 
    conveyor: 'Healthy',
    lastUpdated: new Date().toLocaleTimeString()
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">System Health</h2>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">System Status</span>
              <div className="flex items-center">
                {getStatusIcon(systemHealth.status)}
                <span className="ml-1.5 text-sm">{systemHealth.status}</span>
              </div>
            </div>
            <Progress
              value={systemHealth.cpuUsage || 50}
              className="h-2 bg-gray-100"
              indicatorClassName={
                systemHealth.status === 'Healthy' ? 'bg-green-500' :
                systemHealth.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
              }
            />
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium text-gray-700 mb-1">Camera</div>
            <div className="flex items-center">
              {getStatusIcon(componentStatus.camera)}
              <span className="ml-1.5 text-xs text-gray-600">{componentStatus.camera}</span>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium text-gray-700 mb-1">Robot Arm</div>
            <div className="flex items-center">
              {getStatusIcon(componentStatus.robotArm)}
              <span className="ml-1.5 text-xs text-gray-600">{componentStatus.robotArm}</span>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium text-gray-700 mb-1">AI Model</div>
            <div className="flex items-center">
              {getStatusIcon(componentStatus.aiModel)}
              <span className="ml-1.5 text-xs text-gray-600">{componentStatus.aiModel}</span>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="text-sm font-medium text-gray-700 mb-1">Conveyor</div>
            <div className="flex items-center">
              {getStatusIcon(componentStatus.conveyor)}
              <span className="ml-1.5 text-xs text-gray-600">{componentStatus.conveyor}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Bin Levels</h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-xs font-medium text-gray-700">Recyclable</span>
                </div>
                <span className="text-xs text-gray-500">{getBinStatusText(binLevels.recyclable)}</span>
              </div>
              <Progress 
                value={binLevels.recyclable} 
                className="h-2 bg-gray-100" 
                indicatorClassName={getBinLevelColor(binLevels.recyclable)} 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs font-medium text-gray-700">Biodegradable</span>
                </div>
                <span className="text-xs text-gray-500">{getBinStatusText(binLevels.biodegradable)}</span>
              </div>
              <Progress 
                value={binLevels.biodegradable} 
                className="h-2 bg-gray-100" 
                indicatorClassName={getBinLevelColor(binLevels.biodegradable)} 
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-xs font-medium text-gray-700">Non-recyclable</span>
                </div>
                <span className="text-xs text-gray-500">{getBinStatusText(binLevels.nonRecyclable)}</span>
              </div>
              <Progress 
                value={binLevels.nonRecyclable} 
                className="h-2 bg-gray-100" 
                indicatorClassName={getBinLevelColor(binLevels.nonRecyclable)} 
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          Last system check: {componentStatus.lastUpdated}
        </div>
      </div>
    </div>
  );
};

export default SystemHealth; 