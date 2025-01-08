import axiosInstance from './axiosConfig';
import type { LoginCredentials, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    
    // Set the default Authorization header
    if (data.session?.access_token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.session.access_token}`;
    }
    
    return data;
  },

  refreshToken: async () => {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/refresh-token');
    
    if (data.accessToken) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
    }
    
    return data;
  },

  logout: async () => {
    await axiosInstance.post('/auth/logout');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}; 