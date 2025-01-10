import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { workspaceApi } from '../api/workspace';
import type { WorkspaceWithChannels } from '../types/workspace'

interface WorkspaceContextType {
  workspaces: WorkspaceWithChannels[];
  currentWorkspace: WorkspaceWithChannels | null;
  setCurrentWorkspaceByUrl: (workspace_url: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithChannels[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceWithChannels | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await workspaceApi.getWorkspaceWithChannels();
      setWorkspaces(data);
      
      // Only set the first workspace if we have no workspaces loaded yet
      if (data.length > 0 && workspaces.length === 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch workspaces');
      console.error('Error fetching workspaces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    workspaceApi.getWorkspaceWithChannels().then((data: WorkspaceWithChannels[]) => {
      console.log('Workspace with channels:', data);
    });
    refreshWorkspaces();
  }, []); // Remove currentWorkspace from dependencies

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