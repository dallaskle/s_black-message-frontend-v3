import { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Plus } from 'lucide-react';
import AddChannelModal from './AddChannelModal';
import AddDMModal from './AddDMModal';
import { Channel } from '../../types/channel';


export function ChannelList() {
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [isAddDMOpen, setIsAddDMOpen] = useState(false);
  const { 
    currentWorkspace, 
    currentChannel, 
    setCurrentChannel, 
    isLoading, 
    error,
    addChannelToWorkspace 
  } = useWorkspace();

  const handleDMCreated = async (newChannel: Channel) => {
    addChannelToWorkspace(newChannel);
    setCurrentChannel(newChannel);
    setIsAddDMOpen(false);
  };

  if (!currentWorkspace) {
    return (
      <div className="p-4 text-text-secondary">
        Select a workspace to view channels
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Show headers even during loading */}
        <div className="space-y-2">
          <div className="px-4 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-text-secondary uppercase">
              Channels
            </h2>
            <button
              onClick={() => setIsAddChannelOpen(true)}
              className="text-text-secondary hover:text-text-primary"
              aria-label="Add Channel"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 text-text-secondary">Loading channels...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Show headers even when there's an error */}
        <div className="space-y-2">
          <div className="px-4 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-text-secondary uppercase">
              Channels
            </h2>
            <button
              onClick={() => setIsAddChannelOpen(true)}
              className="text-text-secondary hover:text-text-primary"
              aria-label="Add Channel"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 text-accent-error">{error}</div>
        </div>
      </div>
    );
  }

  // Separate channels by type
  const regularChannels = currentWorkspace?.channels.filter(c => c.type === 'channel') || [];
  const dmChannels = currentWorkspace?.channels.filter(c => c.type === 'dm') || [];

  return (
    <div className="space-y-6">
      {/* Regular Channels - Always shown */}
      <div className="space-y-2">
        <div className="px-4 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-text-secondary uppercase">
            Channels
          </h2>
          <button
            onClick={() => setIsAddChannelOpen(true)}
            className="text-text-secondary hover:text-text-primary"
            aria-label="Add Channel"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {regularChannels.length === 0 ? (
          <div className="px-4 text-text-secondary text-sm">
            No channels yet. Click the + to create one.
          </div>
        ) : (
          <ul className="space-y-1">
            {regularChannels.map((channel) => (
              <li key={channel.id}>
                <button
                  onClick={() => setCurrentChannel(channel)}
                  className={`w-full text-sm px-4 py-2 text-left transition-colors ${
                    currentChannel?.id === channel.id
                      ? 'bg-accent-primary/10 text-text-primary'
                      : 'text-text-secondary hover:bg-background-secondary'
                  }`}
                >
                  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis block">
                    # {channel.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Direct Messages - Always shown */}
      <div className="space-y-2">
        <div className="px-4 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-text-secondary uppercase">
            Direct Messages
          </h2>
          <button
            onClick={() => setIsAddDMOpen(true)}
            className="text-text-secondary hover:text-text-primary"
            aria-label="Add Direct Message"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {dmChannels.length === 0 ? (
          <div className="px-4 text-text-secondary text-sm">
            No direct messages yet. Click the + to start one.
          </div>
        ) : (
          <ul className="space-y-1">
            {dmChannels.map((channel) => (
              <li key={channel.id}>
                <button
                  onClick={() => setCurrentChannel(channel)}
                  className={`w-full px-4 py-2 text-left transition-colors ${
                    currentChannel?.id === channel.id
                      ? 'bg-accent-primary/10 text-text-primary'
                      : 'text-text-secondary hover:bg-background-secondary'
                  }`}
                >
                  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis block">
                    # {channel.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddChannelModal 
        isOpen={isAddChannelOpen} 
        onClose={() => setIsAddChannelOpen(false)}
      />
      <AddDMModal 
        isOpen={isAddDMOpen} 
        onClose={() => setIsAddDMOpen(false)}
        onDMCreated={handleDMCreated}
      />
    </div>
  );
}
