import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import LoginPage from "./components/pages/auth/LoginPage";
import Announcements from "./components/pages/Announcements";
import AnnouncementDetails from "./components/pages/AnnouncementDetails";
import CreateAnnouncement from "./components/pages/CreateAnnouncement";
import ManageAdmins from "./components/pages/ManageAdmins";
import ManageStudents from "./components/pages/ManageStudents";
import ManageTeachers from "./components/pages/ManageTeachers";
import { LogOut, Menu, Bell } from "lucide-react";
import ThemedText from "./components/commons/typography/ThemedText";
import "./App.css";

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
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Layout component with navigation
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCount] = useState(5); // Example notification count, replace with dynamic data if needed

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-background-main flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-background-main border-b border-neutral-border p-4 flex justify-between items-center z-50 h-[56px]">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-neutral-text-secondary"
          >
            <Menu size={24} />
          </button>
          <ThemedText variant="h2" className="hidden md:block">
            FET SPACE
          </ThemedText>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-neutral-text-secondary">
            <img
              alt=""
              src="../../src/assets/admins/valerie.jpg"
              className="w-9 h-9 bg-background-neutral rounded-full"
            />
          </button>
          <button className="text-neutral-text-secondary relative">
            <Bell size={22} />
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex flex-1">
        <aside
          className={`w-64 bg-background-main text-neutral-text-secondary flex flex-col border-r border-neutral-border transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:static inset-y-0 h-[100vh] md:h-[calc(100vh-58px)] z-40`}
        >
          <nav className="flex-1 mt-[54px] md:mt-5 overflow-y-auto">
            <NavLink
              to="/announcements"
              className={({ isActive }) =>
                `flex items-center gap-4 p-5 ${
                  isActive ? "bg-background-neutral" : ""
                }`
              }
              end
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-megaphone"
              >
                <path d="M3 10a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3l4 4V3l-4 4H3Z" />
                <path d="M15 13h4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4" />
                <path d="M13 7v10" />
              </svg> */}
              <img src='../../src/assets/announcements.svg' className="" />
              <ThemedText className="relative">Announcements
              <span className="w-2 h-2 bg-error absolute right-[-12px] top-[0px] rounded-full" />

              </ThemedText>
            </NavLink>
            
            <NavLink
              to="/manage-students"
              className={({ isActive }) =>
                `flex items-center gap-4 p-5 ${
                  isActive ? "bg-background-neutral" : ""
                }`
              }
              end
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
                            <img src='../../src/assets/manage-students.svg' className="" />

              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-graduation-cap"
              >
                <path d="M12 6v9" />
                <path d="M2 18v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
                <path d="M22 18h-5" />
                <circle cx="16" cy="6" r="2" />
              </svg> */}
              <ThemedText>Manage Students</ThemedText>
            </NavLink>
            <NavLink
              to="/manage-teachers"
              className={({ isActive }) =>
                `flex items-center gap-4 p-5 ${
                  isActive ? "bg-background-neutral" : ""
                }`
              }
              end
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
                            <img src='../../src/assets/manage-teachers.svg' className="" />

              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-users"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              </svg> */}
              <ThemedText>Manage Teachers</ThemedText>
            </NavLink>
            <NavLink
              to="/manage-admins"
              className={({ isActive }) =>
                `flex items-center gap-4 p-5 ${
                  isActive ? "bg-background-neutral" : ""
                }`
              }
              end
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
              <img src='../../src/assets/manage-admins.svg' className="" />
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-shield-check"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg> */}
              <ThemedText>Manage Admins</ThemedText>
            </NavLink>
            <NavLink
              to="/create-announcement"
              className={({ isActive }) =>
                `flex items-center gap-4 p-5 ${
                  isActive ? "bg-background-neutral" : ""
                }`
              }
              end
              onClick={() => window.innerWidth < 768 && toggleSidebar()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-plus-circle"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              <ThemedText>Create Announcement</ThemedText>
            </NavLink>
          </nav>
          <div className="p-4 border-t border-neutral-border">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-2 text-error rounded"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Main content container */}
        <main className="flex-1 p-5 max-w-4xl mx-auto overflow-y-auto h-[calc(100vh-64px)] hide-scrollbar">
          {children}
        </main>
      </div>
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
            <div className="min-h-screen bg-background-main">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Navigate to="/announcements" replace />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Announcements />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/announcements/:id"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <AnnouncementDetails />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-announcement"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <CreateAnnouncement />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-students"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ManageStudents />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-teachers"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ManageTeachers />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-admins"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <ManageAdmins />
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="*"
                  element={<Navigate to="/announcements" replace />}
                />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
