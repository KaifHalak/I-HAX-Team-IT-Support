import React from 'react';
import { Bell, User, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-surface text-white p-4 flex items-center justify-between">
      <button onClick={toggleSidebar} className="text-white">
        <Menu size={24} />
      </button>
      <nav className="flex space-x-6">
        <a href="#" className="text-primary font-medium">Overview</a>
        {/* <a href="#" className="text-gray-300 hover:text-white">Analytics</a>
        <a href="#" className="text-gray-300 hover:text-white">Data</a>
        <a href="#" className="text-gray-300 hover:text-white">Alerts</a> */}
      </nav>
      <div className="flex items-center space-x-4">
        <Bell size={20} className="text-gray-300 hover:text-white cursor-pointer" />
        <User size={20} className="text-gray-300 hover:text-white cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;