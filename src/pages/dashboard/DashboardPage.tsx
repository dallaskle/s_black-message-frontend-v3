import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { WorkspaceList } from '../../components/workspace/WorkspaceList';
import { ChannelList } from '../../components/channel/ChannelList';
import { MessageList } from '../../components/message/MessageList';
import { WorkspaceProvider } from '../../contexts/WorkspaceContext';
import { MessageProvider } from '../../contexts/MessageContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useState } from 'react';
import { useAuth, useLogout } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';
import { useRealtimeReactions } from '../../hooks/useRealtimeReactions';

// Create a separate header component for better organization
function DashboardHeader() {
  const { currentWorkspace, currentChannel } = useWorkspace();

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
      </div>
    </div>
  );
}

function UserInfo() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const handleLogout = useLogout();

  const onLogout = async () => {
    await handleLogout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="p-4 border-t border-text-secondary/10">
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="text-sm font-medium text-text-primary">
            {user.name}
          </div>
          <div className="text-xs text-text-secondary truncate">
            {user.email}
          </div>
        </div>
        <Button 
          variant="secondary" 
          onClick={onLogout}
          className="w-full text-sm"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

// Move the dashboard content to a separate component
function DashboardContent() {
  const [workspaceWidth, setWorkspaceWidth] = useState(240);
  const [channelWidth, setChannelWidth] = useState(240);
  const { currentChannel } = useWorkspace();

  useRealtimeMessages(currentChannel?.id);
  useRealtimeReactions(currentChannel?.id);

  return (
    <div className="h-screen bg-background-primary flex overflow-hidden">
      {/* Workspace List */}
      <div 
        className="relative h-full flex flex-col bg-background-secondary border-r border-text-secondary/10"
        style={{ 
          width: `${workspaceWidth}px`,
          minWidth: '180px',
          maxWidth: '400px'
        }}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <WorkspaceList />
          </div>
        </div>
        <UserInfo />
        {/* Resize Handle */}
        <div 
          className="absolute top-0 right-[-6px] bottom-0 w-3 cursor-col-resize hover:bg-accent-primary/50 active:bg-accent-primary group"
          style={{ padding: '0 6px' }}
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = workspaceWidth;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const newWidth = startWidth + (moveEvent.clientX - startX);
              if (newWidth >= 180 && newWidth <= 400) {
                setWorkspaceWidth(newWidth);
              }
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="h-full w-[2px] bg-text-secondary/10 group-hover:bg-accent-primary/50 group-active:bg-accent-primary" />
        </div>
      </div>

      {/* Channel List */}
      <div 
        className="relative h-full flex flex-col bg-background-secondary/50 border-r border-text-secondary/10"
        style={{ 
          width: `${channelWidth}px`,
          minWidth: '180px',
          maxWidth: '400px'
        }}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <ChannelList />
          </div>
        </div>
        {/* Resize Handle */}
        <div 
          className="absolute top-0 right-[-6px] bottom-0 w-3 cursor-col-resize hover:bg-accent-primary/50 active:bg-accent-primary group"
          style={{ padding: '0 6px' }}
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = channelWidth;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const newWidth = startWidth + (moveEvent.clientX - startX);
              if (newWidth >= 180 && newWidth <= 400) {
                setChannelWidth(newWidth);
              }
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="h-full w-[2px] bg-text-secondary/10 group-hover:bg-accent-primary/50 group-active:bg-accent-primary" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DashboardHeader />
        <MessageList />
      </div>
    </div>
  );
}

// Main DashboardPage component now only handles providers and loading state
export function DashboardPage() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <WorkspaceProvider>
        <MessageProvider user={user}>
          <DashboardContent />
        </MessageProvider>
    </WorkspaceProvider>
  );
}
