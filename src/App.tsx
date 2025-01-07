import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage';
import { EmailLoginPage } from './pages/auth/EmailLoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { authApi } from './api/auth';

function App() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTokens = async () => {
      console.log('checkTokens');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('refreshToken', refreshToken);
      if (refreshToken) {
        console.log('refreshToken', refreshToken);
        try {
          await authApi.refreshToken();
          console.log('refreshToken success');
          setIsLoading(false);
          if (window.location.pathname === '/login' || window.location.pathname === '/') {
            window.location.href = '/dashboard';
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Optionally redirect to login if refresh fails
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        setIsLoading(false);
      }
    };

    console.log('isLoading', isLoading);

    checkTokens();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" style={{
          border: '8px solid lightgray',
          borderTop: '8px solid gray',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/email-verification" element={<EmailVerificationPage />} />
        <Route path="/email-login" element={<EmailLoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
