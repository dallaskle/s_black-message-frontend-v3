import axios from 'axios';
//import { authApi } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
/*
// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const response = await authApi.refreshToken();
        
        // Retry the original request with new token
        if (response.session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${response.session.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, check current location before redirecting
        console.error('Token refresh failed:', refreshError);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
); 
*/