import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workspaceApi } from '../api/workspace';
import type { WorkspaceWithChannels } from '../types/workspace';
import type { Channel } from '../types/channel';

interface WorkspaceContextType {
  workspaces: WorkspaceWithChannels[];
  currentWorkspace: WorkspaceWithChannels | null;
  setCurrentWorkspaceByUrl: (workspace_url: string) => void;
  currentChannel: Channel | null;
  setCurrentChannel: (channel: Channel | null) => void;
  isLoading: boolean;
  error: string | null;
  refreshWorkspaces: () => Promise<void>;
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

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        setCurrentWorkspaceByUrl,
        currentChannel,
        setCurrentChannel,
        isLoading,
        error,
        refreshWorkspaces,
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