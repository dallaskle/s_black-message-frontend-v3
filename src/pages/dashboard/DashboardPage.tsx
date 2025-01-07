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
import { useState } from 'react';

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
  const [workspaceWidth, setWorkspaceWidth] = useState(240);
  const [channelWidth, setChannelWidth] = useState(240);

  return (
    <WorkspaceProvider>
      <ChannelProvider>
        <MessageProvider>
          <div className="min-h-screen bg-background-primary flex">
            {/* Workspace List */}
            <div 
              className="relative bg-background-secondary border-r border-text-secondary/10"
              style={{ 
                width: `${workspaceWidth}px`,
                minWidth: '180px',
                maxWidth: '400px'
              }}
            >
              <div className="p-4 overflow-x-hidden">
                <WorkspaceList />
              </div>
              {/* Wider Resize Handle */}
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
                {/* Visual indicator for the handle */}
                <div className="h-full w-[2px] bg-text-secondary/10 group-hover:bg-accent-primary/50 group-active:bg-accent-primary" />
              </div>
            </div>

            {/* Channel List */}
            <div 
              className="relative bg-background-secondary/50 border-r border-text-secondary/10"
              style={{ 
                width: `${channelWidth}px`,
                minWidth: '180px',
                maxWidth: '400px'
              }}
            >
              <div className="p-4 overflow-x-hidden">
                <ChannelList />
              </div>
              {/* Wider Resize Handle */}
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
                {/* Visual indicator for the handle */}
                <div className="h-full w-[2px] bg-text-secondary/10 group-hover:bg-accent-primary/50 group-active:bg-accent-primary" />
              </div>
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
