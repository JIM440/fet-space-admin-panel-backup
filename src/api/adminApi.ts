import api from './axios';

interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface AddUserData {
  name: string;
  id: string; // e.g., teacherId, studentId, adminId
  email: string;
  password?: string;
}

interface BulkAddUserData {
  users: AddUserData[];
}

export const getAllTeachers = async (): Promise<User[]> => {
  const response = await api.get('/admin/teachers');
  return response.data;
};

export const addTeacher = async (data: AddUserData): Promise<User> => {
  const response = await api.post('/admin/teachers', data);
  return response.data;
};

export const addMultipleTeachers = async (data: BulkAddUserData): Promise<User[]> => {
  const response = await api.post('/admin/teachers/bulk', data);
  return response.data;
};

export const editTeacher = async (teacherId: string, data: Partial<AddUserData>): Promise<User> => {
  const response = await api.put(`/admin/teachers/${teacherId}`, data);
  return response.data;
};

export const deleteTeacher = async (teacherId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/teachers/${teacherId}`);
  return response.data;
};

export const getAllStudents = async (): Promise<User[]> => {
  const response = await api.get('/admin/students');
  return response.data;
};

export const addStudent = async (data: AddUserData): Promise<User> => {
  const response = await api.post('/admin/students', data);
  return response.data;
};

export const addMultipleStudents = async (data: BulkAddUserData): Promise<User[]> => {
  const response = await api.post('/admin/students/bulk', data);
  return response.data;
};

export const editStudent = async (studentId: string, data: Partial<AddUserData>): Promise<User> => {
  const response = await api.put(`/admin/students/${studentId}`, data);
  return response.data;
};

export const deleteStudent = async (studentId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/students/${studentId}`);
  return response.data;
};

export const getAllAdmins = async (): Promise<User[]> => {
  const response = await api.get('/admin/admins');
  return response.data;
};

export const addAdmin = async (data: AddUserData): Promise<User> => {
  const response = await api.post('/admin/admins', data);
  return response.data;
};

export const editAdmin = async (adminId: string, data: Partial<AddUserData>): Promise<User> => {
  const response = await api.put(`/admin/admins/${adminId}`, data);
  return response.data;
};

export const deleteAdmin = async (adminId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/admins/${adminId}`);
  return response.data;
};