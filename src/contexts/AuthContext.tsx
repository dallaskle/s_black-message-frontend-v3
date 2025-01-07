import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { useWorkspace } from './WorkspaceContext';
import { useChannel } from './ChannelContext';
import { useMessage } from './MessageContext';

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const refreshAuth = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await authApi.refreshToken();
      setUser(response.user);
      setIsAuthenticated(true);
      clearError();
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setError(error instanceof Error ? error.message : 'Authentication failed');
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshAuth();
      } catch (error) {
        // Silent failure on initial load
        console.error('Initial auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      clearError();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      clearError();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        error,
        login,
        logout,
        refreshAuth,
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
    await logout();
    setCurrentWorkspace(null as any);
    setCurrentChannel(null as any);
    setMessages([]);
  };

  return handleLogout;
}
