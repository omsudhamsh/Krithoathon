import React from 'react';
import { Recycle, Leaf, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { useWasteData } from '../../context/WasteDataContext';

const StatsCards: React.FC = () => {
  const { stats } = useWasteData();

  const cards = [
    {
      title: 'Total Waste Classified',
      value: stats.totalClassified,
      icon: <Recycle className="h-8 w-8 text-blue-500" />,
      change: '+12.5%',
      trend: 'up',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Recyclable Waste',
      value: stats.recyclable,
      icon: <Recycle className="h-8 w-8 text-green-500" />,
      change: '+8.2%',
      trend: 'up',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Biodegradable Waste',
      value: stats.biodegradable,
      icon: <Leaf className="h-8 w-8 text-yellow-500" />,
      change: '+5.1%',
      trend: 'up',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      title: 'Non-recyclable Waste',
      value: stats.nonRecyclable,
      icon: <ArrowDownCircle className="h-8 w-8 text-red-500" />,
      change: '-3.4%',
      trend: 'down',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`p-6 rounded-lg shadow-sm border ${card.bgColor} ${card.borderColor} transition-transform duration-200 hover:scale-105`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className="p-2 rounded-md bg-white shadow-sm">
              {card.icon}
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp 
              size={16} 
              className={card.trend === 'up' ? 'text-green-500' : 'text-red-500'} 
            />
            <span 
              className={`ml-1 text-sm font-medium ${
                card.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {card.change}
            </span>
            <span className="ml-1 text-sm text-gray-500">from last week</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;