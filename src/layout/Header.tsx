import React from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ title, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const isAnnouncementsPage = location.pathname === '/announcements';

  return (
    <header className="bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-white ml-4 md:ml-0">
            {title}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {isAnnouncementsPage && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
              <Plus size={16} />
              <span className="hidden sm:inline">Create</span>
            </button>
          )}
          <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;