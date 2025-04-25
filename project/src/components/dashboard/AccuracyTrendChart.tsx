import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { useWasteData } from '../../context/WasteDataContext';

Chart.register(...registerables);

const AccuracyTrendChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const { accuracyTrend } = useWasteData();

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy existing chart if it exists
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
        
        chartInstanceRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: accuracyTrend.map(item => item.date),
            datasets: [
              {
                label: 'Recyclable',
                data: accuracyTrend.map(item => item.recyclable),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Biodegradable',
                data: accuracyTrend.map(item => item.biodegradable),
                borderColor: 'rgba(245, 158, 11, 1)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Non-recyclable',
                data: accuracyTrend.map(item => item.nonRecyclable),
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                min: 50,
                max: 100,
                title: {
                  display: true,
                  text: 'Accuracy (%)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Date'
                }
              }
            },
            plugins: {
              legend: {
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Classification Accuracy Trend',
                font: {
                  size: 16
                },
                padding: {
                  top: 10,
                  bottom: 20
                }
              }
            },
            interaction: {
              mode: 'index',
              intersect: false
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
  }, [accuracyTrend]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="h-80">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default AccuracyTrendChart;