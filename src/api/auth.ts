import axiosInstance from './axiosConfig';
import type { LoginCredentials, AuthResponse } from '../types/auth';

interface RefreshTokenResponse {
  user: User;
  accessToken: string;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  refreshSubscribers.forEach((callback) => {
    if (error) {
      callback('');
    } else if (token) {
      callback(token);
    }
  });
  refreshSubscribers = [];
};

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
    
    if (data.session?.access_token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.session.access_token}`;
    }
    
    return data;
  },

  refreshToken: async () => {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push((token) => {
          if (token) {
            resolve({ accessToken: token, user: null });
          } else {
            reject(new Error('Refresh failed'));
          }
        });
      });
    }

    isRefreshing = true;

    try {
      const { data } = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh-token');
      
      if (!data || !data.accessToken) {
        delete axiosInstance.defaults.headers.common.Authorization;
        processQueue(new Error('No access token received'), null);
        return null;
      }
      
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
      processQueue(null, data.accessToken);
      return data;
    } catch (error) {
      delete axiosInstance.defaults.headers.common.Authorization;
      processQueue(error, null);
      return null;
    } finally {
      isRefreshing = false;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      delete axiosInstance.defaults.headers.common.Authorization;
    }
  }
}; 