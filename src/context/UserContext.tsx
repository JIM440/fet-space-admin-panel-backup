import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types';

interface UserContextType {
  users: User[];
  addUser: (user: User) => void;
  addUsers: (users: User[]) => void;
  getFilteredUsers: (role: 'Student' | 'Teacher' | 'Admin', searchTerm?: string) => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

// Sample data
const sampleUsers: User[] = [
  { id: '1', name: 'Arrey Tabi', email: 'arrey@fet.com', role: 'Student', studentId: 'FE21A828', joinDate: '2024-01-15' },
  { id: '2', name: 'John Doe', email: 'john@fet.com', role: 'Teacher', joinDate: '2023-09-01' },
  { id: '3', name: 'Jane Smith', email: 'jane@fet.com', role: 'Admin', joinDate: '2023-08-15' },
  { id: '4', name: 'Bob Wilson', email: 'bob@fet.com', role: 'Student', studentId: 'FE21A829', joinDate: '2024-02-01' },
  { id: '5', name: 'Alice Johnson', email: 'alice@fet.com', role: 'Teacher', joinDate: '2023-10-15' },
];

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(sampleUsers);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const addUsers = (newUsers: User[]) => {
    setUsers(prev => [...prev, ...newUsers]);
  };

  const getFilteredUsers = (role: 'Student' | 'Teacher' | 'Admin', searchTerm: string = '') => {
    return users.filter(user => 
      user.role === role && 
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  };

  const value: UserContextType = {
    users,
    addUser,
    addUsers,
    getFilteredUsers,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};