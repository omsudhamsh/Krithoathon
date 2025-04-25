import React from 'react';
import StatsCards from '../components/dashboard/StatsCards';
import WasteDistributionChart from '../components/dashboard/WasteDistributionChart';
import RecentClassifications from '../components/dashboard/RecentClassifications';
import WasteUploader from '../components/dashboard/WasteUploader';
import RobotArmSimulation from '../components/dashboard/RobotArmSimulation';
import AccuracyTrendChart from '../components/dashboard/AccuracyTrendChart';
import LiveFeed from '../components/dashboard/LiveFeed';
import AIPerformanceMetrics from '../components/dashboard/AIPerformanceMetrics';
import BinLevels from '../components/dashboard/BinLevels';
import SystemHealth from '../components/dashboard/SystemHealth';
import WasteTrends from '../components/dashboard/WasteTrends';
import WebcamCapture from '../components/dashboard/WebcamCapture';
import { DownloadIcon, RefreshCw } from 'lucide-react';
import { useWasteData } from '../context/WasteDataContext';

const Dashboard: React.FC = () => {
  const { exportToCSV, refreshSystemStatus } = useWasteData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Waste Bot Dashboard</h1>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <button 
            onClick={refreshSystemStatus}
            className="flex items-center px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          >
            <RefreshCw size={16} className="mr-1.5 text-gray-600" />
            Refresh Data
          </button>
          <button 
            onClick={exportToCSV}
            className="flex items-center px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
          >
            <DownloadIcon size={16} className="mr-1.5 text-gray-600" />
            Export CSV
          </button>
        </div>
      </div>
      
      <StatsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WasteDistributionChart />
        <AccuracyTrendChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WasteTrends />
        <AIPerformanceMetrics />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <LiveFeed />
          <SystemHealth />
        </div>
        <div className="space-y-6">
          <WebcamCapture />
          <WasteUploader />
          <BinLevels />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentClassifications />
        <RobotArmSimulation />
      </div>
    </div>
  );
};

export default Dashboard;