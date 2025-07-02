import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

const baseURL = "http://localhost:8989";

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store tokens in localStorage (or use a more secure method in production)
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken  = () => localStorage.getItem("refreshToken");
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Request Interceptor: Attach Bearer token to requests
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.expired &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        try {
          console.log("refreshing tokenss....");

          const { data } = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });
          setTokens(data.accessToken, data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = "/login"; // Redirect to login on refresh failure
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
