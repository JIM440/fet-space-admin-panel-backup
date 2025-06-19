import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Users, UserCheck, Shield } from 'lucide-react';
import type { MenuItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { logout } = useAuth();

  const menuItems: MenuItem[] = [
    { id: 'announcements', label: 'Announcements', icon: Bell, path: '/announcements' },
    { id: 'students', label: 'Manage Students', icon: Users, path: '/students' },
    { id: 'teachers', label: 'Manage Teachers', icon: UserCheck, path: '/teachers' },
    { id: 'admins', label: 'Manage Admins', icon: Shield, path: '/admins' }
  ];

  return (
    <div className={`bg-gray-800 w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}>
      <div className="flex items-center space-x-2 px-4">
        <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
        <span className="text-2xl font-bold text-white">FET SPACE</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-4 py-2 text-left rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;