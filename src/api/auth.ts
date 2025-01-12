import axiosInstance from './axiosConfig';
import type { LoginCredentials, LoginAuthResponse, RefreshAuthResponse } from '../types/auth';
import type { User } from '../types/User';

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

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  autoVerify?: boolean;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
  session?: {
    access_token: string;
  };
}

interface AuthApi {
  register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
  login: (credentials: LoginCredentials) => Promise<LoginAuthResponse>;
  refreshToken: () => Promise<RefreshAuthResponse | null>;
  logout: () => Promise<void>;
  verifyEmail: (email: string) => Promise<void>;
}

export const authApi: AuthApi = {
  register: async (credentials: RegisterCredentials) => {
    const { data } = await axiosInstance.post<RegisterResponse>('/auth/register', {
      ...credentials,
      autoVerify: true // Always auto-verify
    });
    
    // If we get back a session, set it
    if (data.session?.access_token) {
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.session.access_token}`;
    }
    
    return data;
  },

  verifyEmail: async (email: string) => {
    await axiosInstance.post('/auth/verify-email', { email });
  },

  login: async (credentials: LoginCredentials) => {
    const { data } = await axiosInstance.post<LoginAuthResponse>('/auth/login', credentials);
    
    if (data.session.access_token) {
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
      const { data } = await axiosInstance.post<RefreshAuthResponse>('/auth/refresh-token');
      
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