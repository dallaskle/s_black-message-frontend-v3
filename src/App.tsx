import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage';
import { EmailLoginPage } from './pages/auth/EmailLoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { PublicRoute } from './components/routes/PublicRoute';
import Spinner from './components/ui/Spinner';

// Create a separate component for the root route
function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // When loading is done, redirect based on auth state
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace /> 
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/email-verification" 
            element={
              <PublicRoute>
                <EmailVerificationPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/email-login" 
            element={
              <PublicRoute>
                <EmailLoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<RootRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
