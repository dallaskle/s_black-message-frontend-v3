import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage';
import { EmailLoginPage } from './pages/auth/EmailLoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import Spinner from './components/ui/Spinner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/email-login" element={<EmailLoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
