import React, { useState } from 'react';
import { useWasteData } from '../../context/WasteDataContext';
import { Brain, RefreshCw, BarChart3, PieChart } from 'lucide-react';

const AIPerformanceMetrics: React.FC = () => {
  const { aiMetrics, refreshSystemStatus } = useWasteData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshSystemStatus();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center">
          <Brain size={18} className="text-purple-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">AI Performance Metrics</h2>
        </div>
        <button 
          onClick={handleRefresh} 
          className={`p-1 rounded text-gray-500 hover:bg-gray-100 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-purple-600">Accuracy</p>
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <BarChart3 size={12} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-purple-700">{aiMetrics.accuracy}%</p>
          </div>
          
          <div className="p-3 bg-indigo-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-indigo-600">Precision</p>
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                <BarChart3 size={12} className="text-indigo-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-indigo-700">{aiMetrics.precision}%</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-blue-600">Recall</p>
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <BarChart3 size={12} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-blue-700">{aiMetrics.recall}%</p>
          </div>
          
          <div className="p-3 bg-cyan-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs text-cyan-600">F1 Score</p>
              <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center">
                <BarChart3 size={12} className="text-cyan-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-cyan-700">{aiMetrics.f1Score}%</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <PieChart size={16} className="text-gray-700 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Confusion Matrix</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-2 border border-green-200 bg-green-50 rounded-md">
              <p className="text-xs text-gray-500 mb-1">True Positives</p>
              <p className="text-lg font-medium text-green-700">{aiMetrics.confusionMatrix.truePositives}</p>
            </div>
            
            <div className="p-2 border border-orange-200 bg-orange-50 rounded-md">
              <p className="text-xs text-gray-500 mb-1">False Positives</p>
              <p className="text-lg font-medium text-orange-700">{aiMetrics.confusionMatrix.falsePositives}</p>
            </div>
            
            <div className="p-2 border border-blue-200 bg-blue-50 rounded-md">
              <p className="text-xs text-gray-500 mb-1">True Negatives</p>
              <p className="text-lg font-medium text-blue-700">{aiMetrics.confusionMatrix.trueNegatives}</p>
            </div>
            
            <div className="p-2 border border-red-200 bg-red-50 rounded-md">
              <p className="text-xs text-gray-500 mb-1">False Negatives</p>
              <p className="text-lg font-medium text-red-700">{aiMetrics.confusionMatrix.falseNegatives}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 flex items-center justify-end">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AIPerformanceMetrics; 