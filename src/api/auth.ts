import { apiClient } from './client';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    console.log(data);

    // Save tokens if they exist
    if (data.session?.access_token) {
      localStorage.setItem('accessToken', data.session.access_token);
    }
    if (data.session?.refresh_token) {
      localStorage.setItem('refreshToken', data.session.refresh_token);
    }
    
    return data;
  },

  register: async (credentials: RegisterCredentials) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/refresh-token', { 
        token: refreshToken 
      });
      
      // Update tokens
      if (data.session?.access_token) {
        localStorage.setItem('accessToken', data.session.access_token);
      }
      if (data.session?.refresh_token) {
        localStorage.setItem('refreshToken', data.session.refresh_token);
      }
      
      return data;
    } catch (error) {
      // If refresh fails, clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}; 