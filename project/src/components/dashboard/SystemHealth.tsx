import React, { useState } from 'react';
import { useWasteData } from '../../context/WasteDataContext';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Gauge, 
  Clock, 
  RefreshCw, 
  Cpu, 
  HardDrive 
} from 'lucide-react';

const SystemHealth: React.FC = () => {
  const { systemHealth, refreshSystemStatus } = useWasteData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshSystemStatus();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = (status: 'Healthy' | 'Warning' | 'Critical') => {
    switch (status) {
      case 'Healthy':
        return 'text-green-500';
      case 'Warning':
        return 'text-yellow-500';
      case 'Critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: 'Healthy' | 'Warning' | 'Critical') => {
    switch (status) {
      case 'Healthy':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'Warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'Critical':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getColorClass = (value: number, thresholds: [number, number]) => {
    const [warning, critical] = thresholds;
    if (value < warning) return 'text-green-500';
    if (value < critical) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressBarColor = (value: number, thresholds: [number, number]) => {
    const [warning, critical] = thresholds;
    if (value < warning) return 'bg-green-500';
    if (value < critical) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center">
          <Gauge size={18} className="text-blue-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">System Health</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {getStatusIcon(systemHealth.status)}
            <span className={`ml-1 text-sm ${getStatusColor(systemHealth.status)}`}>
              {systemHealth.status}
            </span>
          </div>
          <button 
            onClick={handleRefresh} 
            className={`p-1 rounded text-gray-500 hover:bg-gray-100 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Uptime */}
        <div className="flex items-start">
          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <Clock size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">System Uptime</h3>
            <p className="text-lg font-semibold text-gray-900">{systemHealth.uptime} hours</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.floor(systemHealth.uptime / 24)} days, {systemHealth.uptime % 24} hours
            </p>
          </div>
        </div>

        {/* Response Time */}
        <div className="flex items-start">
          <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <Gauge size={16} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Avg. Response Time</h3>
            <p className="text-lg font-semibold text-gray-900">{systemHealth.responseTime} ms</p>
            <p className="text-xs text-gray-500 mt-1">
              {systemHealth.responseTime < 50 ? 'Excellent' : systemHealth.responseTime < 100 ? 'Good' : 'Needs Attention'}
            </p>
          </div>
        </div>

        {/* Processing Rate */}
        <div className="flex items-start">
          <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <Cpu size={16} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Processing Rate</h3>
            <p className="text-lg font-semibold text-gray-900">{systemHealth.processingRate} images/min</p>
            <p className="text-xs text-gray-500 mt-1">
              {systemHealth.processingRate > 30 ? 'High Throughput' : 'Normal Performance'}
            </p>
          </div>
        </div>

        {/* Error Rate */}
        <div className="flex items-start">
          <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <AlertCircle size={16} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Error Rate</h3>
            <p className={`text-lg font-semibold ${getColorClass(systemHealth.errorRate, [1, 1.5])}`}>
              {systemHealth.errorRate}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {systemHealth.errorRate < 1 ? 'Within normal range' : 'Above threshold'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Resource Usage</h3>
          
          {/* Storage */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <HardDrive size={14} className="text-gray-500 mr-1.5" />
                <span className="text-xs text-gray-600">Storage</span>
              </div>
              <span className={`text-xs ${getColorClass(systemHealth.storageUsed, [70, 90])}`}>
                {systemHealth.storageUsed}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`${getProgressBarColor(systemHealth.storageUsed, [70, 90])} h-1.5 rounded-full`} 
                style={{ width: `${systemHealth.storageUsed}%` }}
              ></div>
            </div>
          </div>
          
          {/* CPU */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Cpu size={14} className="text-gray-500 mr-1.5" />
                <span className="text-xs text-gray-600">CPU</span>
              </div>
              <span className={`text-xs ${getColorClass(systemHealth.cpuUsage, [50, 80])}`}>
                {systemHealth.cpuUsage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`${getProgressBarColor(systemHealth.cpuUsage, [50, 80])} h-1.5 rounded-full`} 
                style={{ width: `${systemHealth.cpuUsage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Memory */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <span className="block w-2.5 h-2.5 border-2 border-gray-500 rounded-sm"></span>
                </div>
                <span className="text-xs text-gray-600 ml-1">Memory</span>
              </div>
              <span className={`text-xs ${getColorClass(systemHealth.memoryUsage, [60, 85])}`}>
                {systemHealth.memoryUsage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`${getProgressBarColor(systemHealth.memoryUsage, [60, 85])} h-1.5 rounded-full`} 
                style={{ width: `${systemHealth.memoryUsage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-3 flex justify-between items-center">
        <span className="text-xs text-gray-500">Last refreshed: {new Date().toLocaleTimeString()}</span>
        <button 
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          onClick={handleRefresh}
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default SystemHealth; 