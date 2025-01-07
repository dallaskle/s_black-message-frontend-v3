import { apiClient } from './client';
import type { Channel, ChannelMember } from '../types/channel';

export const channelApi = {
  getWorkspaceChannels: async (workspaceId: string) => {
    const { data } = await apiClient.get<Channel[]>(
      `/api/workspaces/${workspaceId}/channels`
    );
    return data;
  },

  getChannel: async (channelId: string) => {
    const { data } = await apiClient.get<Channel>(`/api/channels/${channelId}`);
    return data;
  },

  createChannel: async (workspaceId: string, channel: { 
    name: string;
    is_private?: boolean;
    topic?: string;
    description?: string;
  }) => {
    const { data } = await apiClient.post<Channel>(
      `/api/workspaces/${workspaceId}/channels`,
      channel
    );
    return data;
  },

  createDM: async (workspaceId: string, targetUserId: string) => {
    const { data } = await apiClient.post<Channel>(
      `/api/workspaces/${workspaceId}/dm`,
      { targetUserId }
    );
    return data;
  },
}; 