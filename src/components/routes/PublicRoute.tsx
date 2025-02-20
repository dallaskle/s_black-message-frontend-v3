import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}
