import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import LoginPage from './auth/LoginPage';
import Announcements from './components/pages/Announcements';
import AnnouncementDetails from './components/pages/AnnouncementDetails';
import CreateAnnouncement from './components/pages/CreateAnnouncement';
import ManageAdmins from './components/pages/ManageAdmins';
import ManageStudents from './components/pages/ManageStudents';
import ManageTeachers from './components/pages/ManageTeachers';
import { LogOut } from 'lucide-react';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isLoggedIn, userRole } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/announcements" replace />;
  }
  return <>{children}</>;
};

// Layout component with navigation
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userRole, logout } = useAuth();
  const isAdmin = userRole === 'Admin' || userRole === 'SuperAdmin';
  const isSuperAdmin = userRole === 'SuperAdmin';

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          FET SPACE
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/announcements"
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Announcements
          </Link>
          {/* {isAdmin && ( */}
            <>
              <Link
                to="/create-announcement"
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Create Announcement
              </Link>
              <Link
                to="/manage-teachers"
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Manage Teachers
              </Link>
              <Link
                to="/manage-students"
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Manage Students
              </Link>
                <Link
                  to="/manage-admins"
                  className="block px-4 py-2 rounded hover:bg-gray-700"
                >
                  Manage Admins
                </Link>
            </>
          {/* )} */}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-red-400 hover:bg-gray-700 rounded"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <Router>
            <div className="min-h-screen bg-gray-900">
              <Routes>
                <Route
                  path="/login"
                  element={<LoginPage />}
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute allowedRoles={['Student', 'Teacher', 'Admin', 'SuperAdmin']}>
                      <DashboardLayout>
                        <Navigate to="/announcements" replace />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute allowedRoles={['Student', 'Teacher', 'Admin', 'SuperAdmin']}>
                      <DashboardLayout>
                        <Announcements />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements/:id"
                  element={
                    <ProtectedRoute allowedRoles={['Student', 'Teacher', 'Admin', 'SuperAdmin']}>
                      <DashboardLayout>
                        <AnnouncementDetails />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-announcement"
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                      <DashboardLayout>
                        <CreateAnnouncement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-students"
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                      <DashboardLayout>
                        <ManageStudents />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-teachers"
                  element={
                    <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                      <DashboardLayout>
                        <ManageTeachers />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-admins"
                  element={
                    <ProtectedRoute allowedRoles={['SuperAdmin']}>
                      <DashboardLayout>
                        <ManageAdmins />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/announcements" replace />} />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;