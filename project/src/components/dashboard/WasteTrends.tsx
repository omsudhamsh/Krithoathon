import React, { useEffect, useRef } from 'react';
import { useWasteData } from '../../context/WasteDataContext';
import { LineChart, BarChart3, RefreshCw, ArrowDown, DownloadIcon } from 'lucide-react';

// We will simulate Chart.js with a simple canvas-based chart for this example
const WasteTrends: React.FC = () => {
  const { wasteTrends, exportToCSV, refreshSystemStatus } = useWasteData();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Format the date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  // Draw a simple bar chart on the canvas
  useEffect(() => {
    if (!canvasRef.current || wasteTrends.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find the maximum value for scaling
    const maxValue = Math.max(
      ...wasteTrends.map(d => Math.max(d.recyclable, d.biodegradable, d.nonRecyclable))
    );
    
    // Draw the axes
    ctx.beginPath();
    ctx.strokeStyle = '#e2e8f0';
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw horizontal grid lines
    const gridLines = 5;
    ctx.textAlign = 'right';
    ctx.font = '10px Arial';
    ctx.fillStyle = '#718096';
    
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (availableHeight * (1 - i / gridLines));
      const value = Math.round((maxValue * i) / gridLines);
      
      ctx.beginPath();
      ctx.strokeStyle = '#f1f5f9';
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      
      ctx.fillText(value.toString(), padding - 5, y + 3);
    }
    
    // Draw the data
    const barWidth = availableWidth / (wasteTrends.length * 3 + (wasteTrends.length - 1));
    const groupWidth = barWidth * 3 + 4;
    
    wasteTrends.forEach((data, index) => {
      const x = padding + (groupWidth * index);
      
      // Draw recyclable bar
      const recyclableHeight = (data.recyclable / maxValue) * availableHeight;
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(
        x, 
        height - padding - recyclableHeight, 
        barWidth, 
        recyclableHeight
      );
      
      // Draw biodegradable bar
      const biodegradableHeight = (data.biodegradable / maxValue) * availableHeight;
      ctx.fillStyle = '#eab308';
      ctx.fillRect(
        x + barWidth + 2, 
        height - padding - biodegradableHeight, 
        barWidth, 
        biodegradableHeight
      );
      
      // Draw non-recyclable bar
      const nonRecyclableHeight = (data.nonRecyclable / maxValue) * availableHeight;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(
        x + (barWidth * 2) + 4, 
        height - padding - nonRecyclableHeight, 
        barWidth, 
        nonRecyclableHeight
      );
      
      // Draw x-axis labels (dates)
      if (index % 2 === 0) { // Only show every other date to avoid crowding
        ctx.fillStyle = '#718096';
        ctx.textAlign = 'center';
        ctx.font = '9px Arial';
        ctx.fillText(
          formatDate(data.date), 
          x + groupWidth / 2, 
          height - padding + 15
        );
      }
    });
    
    // Draw legend
    const legendX = width - padding - 120;
    const legendY = padding + 20;
    
    // Recyclable
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(legendX, legendY, 10, 10);
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'left';
    ctx.font = '10px Arial';
    ctx.fillText('Recyclable', legendX + 15, legendY + 8);
    
    // Biodegradable
    ctx.fillStyle = '#eab308';
    ctx.fillRect(legendX, legendY + 15, 10, 10);
    ctx.fillStyle = '#374151';
    ctx.fillText('Biodegradable', legendX + 15, legendY + 23);
    
    // Non-recyclable
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(legendX, legendY + 30, 10, 10);
    ctx.fillStyle = '#374151';
    ctx.fillText('Non-recyclable', legendX + 15, legendY + 38);
    
  }, [wasteTrends]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center">
          <LineChart size={18} className="text-indigo-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Waste Trends (14-day)</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshSystemStatus}
            className="p-1 rounded text-gray-500 hover:bg-gray-100"
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={exportToCSV}
            className="p-1 rounded text-gray-500 hover:bg-gray-100"
            title="Export as CSV"
          >
            <DownloadIcon size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex mb-4">
          <button className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-l-md">
            Bar
          </button>
          <button className="px-3 py-1 text-xs font-medium text-gray-500 border-t border-r border-b border-gray-200 rounded-r-md">
            Line
          </button>
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-sm mr-1"></div>
              <span className="text-xs text-gray-600">Recyclable</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-sm mr-1"></div>
              <span className="text-xs text-gray-600">Biodegradable</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-sm mr-1"></div>
              <span className="text-xs text-gray-600">Non-recyclable</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-80 w-full">
          <canvas 
            ref={canvasRef}
            width={800}
            height={400}
            className="absolute top-0 left-0 w-full h-full"
          ></canvas>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center text-xs text-gray-500">
            <span className="inline-block w-3 h-3 bg-gray-200 rounded-full mr-1"></span>
            <span>{formatDate(wasteTrends[0]?.date || '')}</span>
            <ArrowDown size={10} className="mx-1 text-gray-400" />
            <span>{formatDate(wasteTrends[wasteTrends.length - 1]?.date || '')}</span>
          </div>
          
          <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
            <BarChart3 size={10} className="mr-1" />
            <span>+12% recyclable trend</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-3">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Data sampled daily</span>
          <button 
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={exportToCSV}
          >
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default WasteTrends; 