import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workspaceApi } from '../api/workspace';
import type { WorkspaceWithChannels } from '../types/workspace';
import type { Channel } from '../types/channel';
import { channelApi } from '../api/channel';

interface WorkspaceContextType {
  workspaces: WorkspaceWithChannels[];
  currentWorkspace: WorkspaceWithChannels | null;
  setCurrentWorkspaceByUrl: (workspace_url: string) => void;
  setCurrentWorkspaceById: (workspace_id: string) => void;
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshWorkspaces: () => Promise<void>;
  refreshCurrentWorkspaceChannels: () => Promise<void>;
  addChannelToWorkspace: (channel: Channel) => void;
  deleteChannel: (channelId: string) => Promise<void>;
  updateWorkspace: (workspace: WorkspaceWithChannels) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithChannels[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceWithChannels | null>(null);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await workspaceApi.getWorkspaceWithChannels();
      setWorkspaces(data);
      
      // Update current workspace with new data if it exists
      if (currentWorkspace) {
        const updatedCurrentWorkspace = data.find(w => w.id === currentWorkspace.id);
        if (updatedCurrentWorkspace) {
          setCurrentWorkspace(updatedCurrentWorkspace);
        }
      } else if (data.length > 0) {
        // Only set the first workspace if we have no current workspace
        setCurrentWorkspace(data[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch workspaces and channels');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCurrentWorkspaceChannels = async () => {
    if (!currentWorkspace) return;
    
    setIsLoading(true);
    try {
      const channels = await channelApi.getWorkspaceChannels(currentWorkspace.id);
      
      // Update current workspace with new channels
      const updatedWorkspace = {
        ...currentWorkspace,
        channels
      };
      
      // Update both states
      setCurrentWorkspace(updatedWorkspace);
      setWorkspaces(prevWorkspaces => 
        prevWorkspaces.map(w => 
          w.id === currentWorkspace.id ? updatedWorkspace : w
        )
      );
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch channels');
    } finally {
      setIsLoading(false);
    }
  };

  const addChannelToWorkspace = (newChannel: Channel) => {
    if (!currentWorkspace) return;
    
    // Update current workspace channels
    const updatedWorkspace = {
      ...currentWorkspace,
      channels: [...currentWorkspace.channels, newChannel]
    };
    
    // Update both states
    setCurrentWorkspace(updatedWorkspace);
    setWorkspaces(prevWorkspaces => 
      prevWorkspaces.map(w => 
        w.id === currentWorkspace.id ? updatedWorkspace : w
      )
    );
  };

  const deleteChannel = async (channelId: string) => {
    if (!currentWorkspace) return;
    
    try {
      await channelApi.deleteChannel(channelId);
      
      // Update workspaces state by removing the deleted channel
      setCurrentWorkspace(prev => {
        if (!prev) return null;
        return {
          ...prev,
          channels: prev.channels.filter(c => c.id !== channelId)
        };
      });
      
      // If the deleted channel was the current channel, reset it
      if (currentChannel?.id === channelId) {
        setCurrentChannel(null);
      }
    } catch (error) {
      throw error;
    }
  };

  const updateWorkspace = (updatedWorkspace: WorkspaceWithChannels) => {
    // Update current workspace if it's the one being updated
    if (currentWorkspace?.id === updatedWorkspace.id) {
      setCurrentWorkspace(updatedWorkspace);
    }
    
    // Update workspaces list
    setWorkspaces(prevWorkspaces =>
      prevWorkspaces.map(w =>
        w.id === updatedWorkspace.id ? updatedWorkspace : w
      )
    );
  };

  // Initial load
  useEffect(() => {
    refreshWorkspaces();
  }, []);

  // Reset current channel when workspace changes
  useEffect(() => {
    setCurrentChannel(null);
  }, [currentWorkspace?.id]);

  const setCurrentWorkspaceByUrl = (workspace_url: string) => {
    if (!workspace_url) {
      setCurrentWorkspace(null);
      return;
    }
    const workspace = workspaces.find(w => w.workspace_url === workspace_url);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  const setCurrentWorkspaceById = (workspace_id: string) => {
    if (!workspace_id) {
      setCurrentWorkspace(null);
      return;
    }
    const workspace = workspaces.find(w => w.id === workspace_id);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspaceByUrl,
        setCurrentWorkspaceById,
        currentChannel,
        setCurrentChannel,
        isLoading,
        error,
        refreshWorkspaces,
        refreshCurrentWorkspaceChannels,
        addChannelToWorkspace,
        deleteChannel,
        updateWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
} 