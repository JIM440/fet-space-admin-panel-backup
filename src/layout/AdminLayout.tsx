import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/announcements':
        return 'Announcements';
      case '/students':
        return 'Manage Students';
      case '/teachers':
        return 'Manage Teachers';
      case '/admins':
        return 'Manage Admins';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={getPageTitle()}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;