import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { channelApi } from '../api/channel';
import { useWorkspace } from './WorkspaceContext';
import type { Channel } from '../types/channel';

interface WorkspaceChannels {
  [workspaceId: string]: Channel[];
}

interface ChannelContextType {
  channels: Channel[];
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshChannels: () => Promise<void>;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export function ChannelProvider({ children }: { children: ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [workspaceChannels, setWorkspaceChannels] = useState<WorkspaceChannels>({});
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshChannels = async () => {
    if (!currentWorkspace) return;
    
    setIsLoading(true);
    try {
      const data = await channelApi.getWorkspaceChannels(currentWorkspace.id);
      setWorkspaceChannels(prev => ({
        ...prev,
        [currentWorkspace.id]: data
      }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch channels');
      console.error('Error fetching channels:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch channels when workspace changes
  useEffect(() => {
    if (!currentWorkspace) {
      return;
    }

    refreshChannels();
  }, [currentWorkspace?.id]);

  // Reset current channel when workspace changes
  useEffect(() => {
    setCurrentChannel(null);
    // Clear workspace channels cache when workspace changes
    setWorkspaceChannels({});
  }, [currentWorkspace?.id]);

  // Get current workspace's channels
  const channels = currentWorkspace 
    ? workspaceChannels[currentWorkspace.id] || []
    : [];

  return (
    <ChannelContext.Provider
      value={{
        channels,
        currentChannel,
        setCurrentChannel,
        isLoading,
        error,
        refreshChannels,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
} 