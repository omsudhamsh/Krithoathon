import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useWasteData } from '../../context/WasteDataContext';

Chart.register(...registerables);

const WasteDistributionChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const { distribution } = useWasteData();

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy existing chart if it exists
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        
        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Recyclable', 'Biodegradable', 'Non-recyclable'],
            datasets: [{
              data: [
                distribution.recyclable,
                distribution.biodegradable,
                distribution.nonRecyclable
              ],
              backgroundColor: [
                'rgba(16, 185, 129, 0.8)',  // Green for recyclable
                'rgba(245, 158, 11, 0.8)',  // Yellow for biodegradable
                'rgba(239, 68, 68, 0.8)',   // Red for non-recyclable
              ],
              borderColor: [
                'rgba(16, 185, 129, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(239, 68, 68, 1)',
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              },
              title: {
                display: true,
                text: 'Waste Distribution by Category',
                font: {
                  size: 16
                },
                padding: {
                  top: 10,
                  bottom: 30
                }
              }
            },
            cutout: '65%',
            animation: {
              animateScale: true,
              animateRotate: true
            }
          }
        });
      }
    }
    
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [distribution]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="h-80">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default WasteDistributionChart;