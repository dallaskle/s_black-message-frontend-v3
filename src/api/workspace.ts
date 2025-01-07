import { apiClient } from './client';
import type { Workspace, WorkspaceMember } from '../types/workspace'

export const workspaceApi = {
  // Get all workspaces for the current user
  getUserWorkspaces: async () => {
    const { data } = await apiClient.get<Workspace[]>('/api/workspaces');
    return data;
  },

  // Get a specific workspace
  getWorkspace: async (workspaceId: string) => {
    const { data } = await apiClient.get<Workspace>(`/api/workspaces/${workspaceId}`);
    return data;
  },

  // Create a new workspace
  createWorkspace: async (workspace: { name: string; workspace_url: string }) => {
    const { data } = await apiClient.post<Workspace>('/api/workspaces', workspace);
    return data;
  },

  // Get workspace members
  getWorkspaceMembers: async (workspaceId: string) => {
    const { data } = await apiClient.get<WorkspaceMember[]>(
      `/api/workspaces/${workspaceId}/members`
    );
    return data;
  },
}; 