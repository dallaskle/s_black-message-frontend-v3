import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { WorkspaceList } from '../../components/workspace/WorkspaceList';
import { ChannelList } from '../../components/channel/ChannelList';
import { MessageList } from '../../components/message/MessageList';
import { WorkspaceProvider } from '../../contexts/WorkspaceContext';
import { ChannelProvider } from '../../contexts/ChannelContext';
import { MessageProvider } from '../../contexts/MessageContext';

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
        <MessageProvider>
          <div className="min-h-screen bg-background-primary flex">
            {/* Workspace List */}
            <div className="w-1/4 bg-background-secondary border-r border-text-secondary/10 p-4">
              <WorkspaceList />
            </div>

            {/* Channel List */}
            <div className="w-1/4 bg-background-secondary/50 border-r border-text-secondary/10 p-4">
              <ChannelList />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-text-secondary/10">
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
              
              <MessageList />
            </div>
          </div>
        </MessageProvider>
      </ChannelProvider>
    </WorkspaceProvider>
  );
}
