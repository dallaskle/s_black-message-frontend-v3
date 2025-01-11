import axiosInstance from './axiosConfig';
import type { Channel } from '../types/channel';

export const channelApi = {
  getWorkspaceChannels: async (workspaceId: string) => {
    const { data } = await axiosInstance.get<Channel[]>(
      `/api/workspaces/${workspaceId}/channels`
    );
    return data;
  },

  getChannel: async (channelId: string) => {
    const { data } = await axiosInstance.get<Channel>(`/api/channels/${channelId}`);
    return data;
  },

  createChannel: async (workspaceId: string, channel: { 
    name: string;
    is_private?: boolean;
    topic?: string;
    description?: string;
  }) => {
    const { data } = await axiosInstance.post<Channel>(
      `/api/workspaces/${workspaceId}/channels`,
      channel
    );
    return data;
  },

  createDM: async (workspaceId: string, targetUserId: string) => {
    const { data } = await axiosInstance.post<Channel>(
      `/api/workspaces/${workspaceId}/dm`,
      { targetUserId }
    );
    return data;
  },

  deleteChannel: async (channelId: string) => {
    await axiosInstance.delete(`/api/channels/${channelId}`);
  },
}; 