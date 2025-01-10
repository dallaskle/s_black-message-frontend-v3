import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { jwtDecode } from 'jwt-decode';
import { useWorkspace } from './WorkspaceContext';
import { useChannel } from './ChannelContext';
import { useMessage } from './MessageContext';
import axiosInstance from '../api/axiosConfig';

interface User {
  id: string;
  email: string;
  name: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout>();

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const handleAuthError = useCallback((error: unknown) => {
    const message = error instanceof Error 
      ? error.message
      : 'An unexpected error occurred';
    
    // Clear token first
    setAccessToken(null);

    // Then update state
    setAuthState(prev => ({ 
      ...prev, 
      error: message,
      isAuthenticated: false,
      isLoading: false,  // Make sure loading is false
      user: null 
    }));

    // Clear any scheduled refresh
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
  }, [refreshTimeout]);

  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const refreshTime = (decoded.exp * 1000) - Date.now() - 60000; // 1 minute before expiry
      
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      
      const timeout = setTimeout(() => authApi.refreshToken(), refreshTime);
      setRefreshTimeout(timeout);
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }, [refreshTimeout]);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authApi.login(credentials);
      if (!response.session?.access_token) {
        throw new Error('No access token received');
      }

      // Set token in axios instance
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${response.session.access_token}`;
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null,
      });

      // Schedule token refresh
      scheduleTokenRefresh(response.session.access_token);
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      // Clear token from axios instance
      delete axiosInstance.defaults.headers.common.Authorization;
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authApi.refreshToken();
      
      if (response?.accessToken) {
        setAccessToken(response.accessToken);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: response.user,
          error: null
        });
        scheduleTokenRefresh(response.accessToken);
        return response.accessToken;
      }
      
      // Clear auth state if refresh fails
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
      setAccessToken(null);
      return null;
    } catch (error) {
      // Clear auth state on error
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null
      });
      setAccessToken(null);
      return null;
    }
  };

  const getAccessToken = useCallback(async () => {
    if (accessToken) {
      try {
        const decoded = jwtDecode<{ exp: number }>(accessToken);
        if (decoded.exp * 1000 > Date.now()) {
          return accessToken;
        }
      } catch (error) {
        console.error('Invalid access token:', error);
      }
    }
    return refreshToken();
  }, [accessToken]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await refreshToken();
        // If no token, just set loading to false and leave isAuthenticated as false
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: !!token
        }));
      } catch (error) {
        // On error, clear the loading state
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          error: null
        }));
      }
    };

    initAuth();

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        getAccessToken,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useLogout() {
  const { logout } = useAuth();
  const { setCurrentWorkspaceByUrl } = useWorkspace();
  const { setCurrentChannel } = useChannel();
  const { setMessages } = useMessage();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setCurrentWorkspaceByUrl(null as any);
      setCurrentChannel(null);
      setMessages([]);
    }
  };

  return handleLogout;
}
