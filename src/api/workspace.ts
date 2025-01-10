import axiosInstance from './axiosConfig';
import type { Workspace, WorkspaceMember, WorkspaceWithChannels } from '../types/workspace'

export const workspaceApi = {
  // Get workspace with channels
  getWorkspaceWithChannels: async () => {
    const { data } = await axiosInstance.get<WorkspaceWithChannels[]>('/api/workspaces/channels');
    return data;
  },

  // Get all workspaces for the current user
  getUserWorkspaces: async () => {
    const { data } = await axiosInstance.get<Workspace[]>('/api/workspaces');
    return data;
  },

  // Get a specific workspace
  getWorkspace: async (workspaceId: string) => {
    const { data } = await axiosInstance.get<Workspace>(`/api/workspaces/${workspaceId}`);
    return data;
  },

  // Create a new workspace
  createWorkspace: async (workspace: { name: string; workspace_url: string }) => {
    const { data } = await axiosInstance.post<Workspace>('/api/workspaces', workspace);
    return data;
  },

  // Get workspace members
  getWorkspaceMembers: async (workspaceId: string) => {
    const { data } = await axiosInstance.get<WorkspaceMember[]>(
      `/api/workspaces/${workspaceId}/members`
    );
    return data;
  },
}; 