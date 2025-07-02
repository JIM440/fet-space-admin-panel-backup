import api from './axios';

export interface LoginCredentials {
  identifier: string;
  password: string;
  role: 'Student' | 'Teacher' | 'Admin' | 'SuperAdmin';
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  message: string;
  user: { userId: number; role: string };
}


export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const setIsSuperAdmin = (isSuperAdmin: boolean) => {
  localStorage.setItem('isSuperAdmin', isSuperAdmin);
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};


export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const getIsSuperAdmin = () => localStorage.getItem('isSuperAdmin');


export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const refreshToken = async (refreshToken: string) => {
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data;
};