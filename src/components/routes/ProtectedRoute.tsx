import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}