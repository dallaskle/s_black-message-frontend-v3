import axiosInstance from './axiosConfig';
import type { LoginCredentials, AuthResponse } from '../types/auth';
import { AxiosError } from 'axios';

interface RefreshTokenResponse {
  user: User;
  accessToken: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    
    // Sets access token in Authorization header
    if (data.session?.access_token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.session.access_token}`;
    }
    
    return data;
  },

  refreshToken: async () => {
    console.log('Frontend: Attempting to refresh token');
    try {
      const { data } = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh-token');
      console.log('Frontend: Refresh token response:', { 
        success: !!data.accessToken,
        user: !!data.user 
      });
      
      if (data.accessToken) {
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      }
      
      return data;
    } catch (error) {
      console.error('Frontend: Refresh token error:', {
        status: (error as AxiosError)?.response?.status,
        message: (error as AxiosError)?.response?.data?.message || (error as Error).message
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      // Always clear the Authorization header, even if the request fails
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  }
}; 