import { useMutation } from '@tanstack/react-query';
import { login, setTokens, clearTokens } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import type { LoginCredentials, LoginResponse } from '../api/authApi';

export const useLogin = () => {
  const { login: setAuth } = useAuth();
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      setAuth(data.user.role);
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