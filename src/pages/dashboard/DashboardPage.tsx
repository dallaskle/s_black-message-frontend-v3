import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { WorkspaceList } from '../../components/workspace/WorkspaceList';
import { ChannelList } from '../../components/channel/ChannelList';
import { MessageList } from '../../components/message/views/MessageList';
import { WorkspaceProvider } from '../../contexts/WorkspaceContext';
import { MessageProvider } from '../../contexts/Message/MessageContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth, useLogout } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';
import { useRealtimeReactions } from '../../hooks/useRealtimeReactions';
import { MemberProvider } from '../../contexts/Member/MemberContext';
import { MembersSidebar } from '../../components/members/MembersSidebar';
import { Users } from 'lucide-react';
import { useMemberContext } from '../../contexts/Member/MemberContext';
import { CloneList } from '../../components/clones/management/CloneList/CloneList';
import { CloneChat } from '../../components/clones/chat/CloneChat/CloneChat';
import { useClone } from '../../contexts/Clone/CloneContext';
import { CloneProvider } from '../../contexts/Clone/CloneContext';

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
const DashboardContent = React.memo(() => {
  const [workspaceWidth, setWorkspaceWidth] = useState(240);
  const [channelWidth, setChannelWidth] = useState(240);
  const [showMembers, setShowMembers] = useState(false);
  const { currentWorkspace, currentChannel } = useWorkspace();
  const { workspaceMembers, channelMembers, fetchWorkspaceMembers, fetchChannelMembers } = useMemberContext();
  const { state: cloneState } = useClone();
  const [showClones, setShowClones] = useState(false);

  useRealtimeMessages(currentChannel?.id);
  useRealtimeReactions(currentChannel?.id);

  // Fetch members whenever channel or workspace changes
  useEffect(() => {
    if (currentChannel?.id) {
      fetchChannelMembers(currentChannel.id);
    }
  }, [currentChannel?.id, fetchChannelMembers]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchWorkspaceMembers(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, fetchWorkspaceMembers]);

  const memberCount = currentChannel?.id 
    ? channelMembers[currentChannel.id]?.length ?? 0 // For channels, only show channel members
    : currentWorkspace?.id
    ? workspaceMembers[currentWorkspace.id]?.length ?? 0
    : 0;

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
        <div className="p-4 border-t border-text-secondary/10">
          <Button
            variant="secondary"
            onClick={() => setShowClones(!showClones)}
            className="w-full text-sm"
          >
            {showClones ? 'Back to Messages' : 'AI Clones'}
          </Button>
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
        {showClones ? (
          // Clones View
          <div className="flex-1 overflow-y-auto p-4">
            {cloneState.selectedClone ? (
              <CloneChat 
                cloneId={cloneState.selectedClone.id} 
                channelId={currentChannel?.id}
              />
            ) : (
              <CloneList key={currentWorkspace?.id} />
            )}
          </div>
        ) : (
          // Regular Messages View
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-text-secondary/10">
              <DashboardHeader />
              {(currentWorkspace || currentChannel) && (
                <Button
                  variant="secondary"
                  onClick={() => setShowMembers(!showMembers)}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  {showMembers ? 'Hide Members' : `Show Members (${memberCount})`}
                </Button>
              )}
            </div>
            <MessageList />
          </>
        )}
      </div>

      {/* Members Sidebar */}
      {showMembers && (
        <MembersSidebar
          workspaceId={currentWorkspace?.id}
          channelId={currentChannel?.id}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
});

// Main DashboardPage component now only handles providers and loading state
export function DashboardPage() {
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <WorkspaceProvider>
      <MessageProvider user={user}>
        <MemberProvider>
          <CloneProvider>
            <DashboardContent />
          </CloneProvider>
        </MemberProvider>
      </MessageProvider>
    </WorkspaceProvider>
  );
}
