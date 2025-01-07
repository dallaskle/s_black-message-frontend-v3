import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background-primary p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <Button 
            variant="secondary" 
            onClick={handleLogout}
            className="px-6"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
