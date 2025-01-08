import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useWorkspace } from './WorkspaceContext';
import { useChannel } from './ChannelContext';
import { useMessage } from './MessageContext';

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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const handleAuthError = useCallback((error: unknown) => {
    const message = error instanceof AxiosError 
      ? error.response?.data?.message || error.message
      : 'An unexpected error occurred';
    
    setAuthState(prev => ({ 
      ...prev, 
      error: message,
      isAuthenticated: false,
      user: null 
    }));
    setAccessToken(null);
  }, []);

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
      setAccessToken(response.session.access_token);
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null,
      });
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
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
      setAccessToken(null);
    }
  };

  const refreshToken = async () => {
    if (isRefreshing) {
      return null;
    }
    
    try {
      setIsRefreshing(true);
      const response = await authApi.refreshToken();
      if (response.accessToken) {
        setAccessToken(response.accessToken);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isLoading: false,
          user: response.user,
        }));
        scheduleTokenRefresh(response.accessToken);
        return response.accessToken;
      }
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        user: null
      }));
      return null;
    } catch (error) {
      handleAuthError(error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null
      }));
      return null;
    } finally {
      setIsRefreshing(false);
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
    refreshToken();
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
  const { setCurrentWorkspace } = useWorkspace();
  const { setCurrentChannel } = useChannel();
  const { setMessages } = useMessage();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setCurrentWorkspace(null as any);
      setCurrentChannel(null);
      setMessages([]);
    }
  };

  return handleLogout;
}
