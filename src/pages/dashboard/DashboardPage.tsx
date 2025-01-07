import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { WorkspaceList } from '../../components/workspace/WorkspaceList';
import { ChannelList } from '../../components/channel/ChannelList';
import { MessageList } from '../../components/message/MessageList';
import { WorkspaceProvider } from '../../contexts/WorkspaceContext';
import { ChannelProvider } from '../../contexts/ChannelContext';
import { MessageProvider } from '../../contexts/MessageContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useChannel } from '../../contexts/ChannelContext';

// Create a separate header component for better organization
function DashboardHeader() {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const { currentChannel } = useChannel();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const getHeaderTitle = () => {
    if (currentChannel) {
      return (
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            # {currentChannel.name}
          </h1>
          {currentWorkspace && (
            <p className="text-sm text-text-secondary">
              {currentWorkspace.name}
            </p>
          )}
        </div>
      );
    }
    
    if (currentWorkspace) {
      return (
        <h1 className="text-2xl font-bold text-text-primary">
          {currentWorkspace.name}
        </h1>
      );
    }

    return (
      <h1 className="text-2xl font-bold text-text-primary">
        Select a Workspace
      </h1>
    );
  };

  return (
    <div className="p-4 border-b border-text-secondary/10">
      <div className="flex justify-between items-center">
        {getHeaderTitle()}
        <Button 
          variant="secondary" 
          onClick={handleLogout}
          className="px-6"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export function DashboardPage() {
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
              <DashboardHeader />
              <MessageList />
            </div>
          </div>
        </MessageProvider>
      </ChannelProvider>
    </WorkspaceProvider>
  );
}
