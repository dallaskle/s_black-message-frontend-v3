import axiosInstance from './axiosConfig';
import { WorkspaceInvitation } from '../types/workspace';

interface CreateInviteParams {
  workspaceId: string;
  email: string;
  role: 'admin' | 'member';
  singleUse?: boolean;
  expiresIn?: number;
}

export const workspaceInviteApi = {
  // Create a new invitation
  createInvite: async (params: CreateInviteParams): Promise<WorkspaceInvitation> => {
    const { workspaceId, ...data } = params;
    const { data: invitation } = await axiosInstance.post<WorkspaceInvitation>(
      `/api/workspaces/${workspaceId}/invitations`,
      data
    );
    return invitation;
  },

  // Get all invitations for a workspace
  getInvitations: async (workspaceId: string): Promise<WorkspaceInvitation[]> => {
    const { data: invitations } = await axiosInstance.get<WorkspaceInvitation[]>(
      `/api/workspaces/${workspaceId}/invitations`
    );
    return invitations;
  },

  // Accept an invitation
  acceptInvite: async (workspaceId: string, token: string): Promise<void> => {
    await axiosInstance.post(`/api/workspaces/${workspaceId}/invitations/accept`, {
      token,
    });
  },

  // Revoke an invitation
  revokeInvite: async (workspaceId: string, invitationId: string): Promise<void> => {
    await axiosInstance.delete(
      `/api/workspaces/${workspaceId}/invitations/${invitationId}`
    );
  },
}; 