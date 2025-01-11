import axiosInstance from './axiosConfig';
import { MemberWithUser, MemberListResponse } from '../types/member';

export const memberApi = {
  getWorkspaceMembers: async (workspaceId: string): Promise<MemberListResponse> => {
    try {
      const { data } = await axiosInstance.get<MemberWithUser[]>(
        `/api/workspaces/${workspaceId}/members/list`
      );
      console.log('Workspace members response:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch workspace members',
      };
    }
  },

  getChannelMembers: async (channelId: string): Promise<MemberListResponse> => {
    try {
      const { data } = await axiosInstance.get<MemberWithUser[]>(
        `/api/workspaces/channels/${channelId}/members/list`
      );
      console.log('Channel members response:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching channel members:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch channel members',
      };
    }
  }
}; 