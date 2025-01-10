import axios from 'axios';
import { authApi } from './auth';
import type { RefreshAuthResponse } from '../types/auth';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry refresh token requests to avoid infinite loops
    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh-token') {
      return Promise.reject(error);
    }

    // Try to refresh token for other 401s
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await authApi.refreshToken();
        if (!response) {
          return Promise.reject(new Error('Failed to refresh token'));
        }
        if (response.accessToken) {
          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          return axiosInstance(originalRequest);
        }
        return Promise.reject(new Error('Failed to refresh token'));
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 