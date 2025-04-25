import React from 'react';
import { Bell, UserCircle, Settings } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Waste Bot</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500">
              <Bell size={20} />
            </button>
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500">
              <Settings size={20} />
            </button>
            <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800">
              <span className="sr-only">User menu</span>
              <UserCircle size={24} className="h-8 w-8 rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;