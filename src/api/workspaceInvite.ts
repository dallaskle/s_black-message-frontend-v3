import { axiosInstance } from './axiosConfig';

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  token: string;
  role: 'admin' | 'member';
  expires_at: string | null;
  single_use: boolean;
  created_by: string;
  created_at: string;
}

interface CreateInviteParams {
  workspaceId: string;
  email: string;
  role?: 'admin' | 'member';
  expiresIn?: number;
  singleUse?: boolean;
}

export const workspaceInviteApi = {
  createInvite: async (params: CreateInviteParams) => {
    const { data } = await axiosInstance.post<WorkspaceInvitation>(
      `/workspace/${params.workspaceId}/invites`, 
      params
    );
    return data;
  },
    
  getInvites: async (workspaceId: string) => {
    const { data } = await axiosInstance.get<WorkspaceInvitation[]>(
      `/workspace/${workspaceId}/invites`
    );
    return data;
  },
    
  acceptInvite: async (workspaceId: string, token: string) => {
    const { data } = await axiosInstance.post(
      `/workspace/${workspaceId}/invites/accept`, 
      { token }
    );
    return data;
  },
    
  revokeInvite: async (workspaceId: string, invitationId: string) => {
    await axiosInstance.delete(
      `/workspace/${workspaceId}/invites/${invitationId}`
    );
  }
}; 