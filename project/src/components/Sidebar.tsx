import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart, 
  Upload, 
  Settings, 
  HelpCircle, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Recycle 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={`bg-white shadow-sm transition-all duration-300 border-r ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <span className="text-lg font-bold text-green-600 flex items-center">
              <Recycle className="mr-2" size={24} />
              WasteBot
            </span>
          )}
          {collapsed && <Recycle className="mx-auto" size={24} color="#10B981" />}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            <SidebarItem 
              to="/" 
              icon={<LayoutDashboard size={20} />} 
              text="Dashboard" 
              collapsed={collapsed} 
            />
            <SidebarItem 
              to="/analytics" 
              icon={<PieChart size={20} />} 
              text="Analytics" 
              collapsed={collapsed} 
            />
            <SidebarItem 
              to="/upload" 
              icon={<Upload size={20} />} 
              text="Upload" 
              collapsed={collapsed} 
            />
            <SidebarItem 
              to="/waste" 
              icon={<Trash2 size={20} />} 
              text="Waste Database" 
              collapsed={collapsed} 
            />
          </ul>
        </nav>
        <div className="border-t p-4">
          <ul className="space-y-1">
            <SidebarItem 
              to="/settings" 
              icon={<Settings size={20} />} 
              text="Settings" 
              collapsed={collapsed} 
            />
            <SidebarItem 
              to="/help" 
              icon={<HelpCircle size={20} />} 
              text="Help & Support" 
              collapsed={collapsed} 
            />
          </ul>
        </div>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  collapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, text, collapsed }) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <span className="text-gray-500">{icon}</span>
        {!collapsed && <span className="ml-3">{text}</span>}
      </Link>
    </li>
  );
};

export default Sidebar;