import { useMutation } from '@tanstack/react-query';
import { login, setTokens, setIsSuperAdmin, clearTokens } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import type { LoginCredentials, LoginResponse } from '../api/authApi';

export const useLogin = () => {
  const { login: setAuth } = useAuth();
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setAuth(data.user.role);
      setIsSuperAdmin(data.user.admin.is_super_admin);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuth();
  return () => {
    clearTokens();
    logout();
  };
};