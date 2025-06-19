import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { clearTokens } from '../api/axios';

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  login: (role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem('accessToken')
  );
  const [userRole, setUserRole] = useState<string | null>(null);

  const login = (role: string) => {
    setIsLoggedIn(true);
    setUserRole(role);
  };

  const logout = () => {
    clearTokens();
    setIsLoggedIn(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};