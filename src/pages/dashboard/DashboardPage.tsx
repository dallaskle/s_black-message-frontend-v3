import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { WorkspaceList } from '../../components/workspace/WorkspaceList';
import { ChannelList } from '../../components/channel/ChannelList';
import { WorkspaceProvider } from '../../contexts/WorkspaceContext';
import { ChannelProvider } from '../../contexts/ChannelContext';

export function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <WorkspaceProvider>
      <ChannelProvider>
        <div className="min-h-screen bg-background-primary">
          {/* Workspace Sidebar */}
          <div className="fixed left-0 top-0 h-full w-64 bg-background-secondary border-r border-text-secondary/10">
            <div className="p-4">
              <WorkspaceList />
            </div>
          </div>

          {/* Channel Sidebar */}
          <div className="fixed left-64 top-0 h-full w-64 bg-background-secondary/50 border-r border-text-secondary/10">
            <div className="p-4">
              <ChannelList />
            </div>
          </div>

          {/* Main content */}
          <div className="ml-128 p-4">
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
      </ChannelProvider>
    </WorkspaceProvider>
  );
}
