import { apiClient } from './client';

export const reactionApi = {
  getReactionCounts: async (channelId: string, messageId: string) => {
    const { data } = await apiClient.get<Record<string, number>>(
      `/api/channels/${channelId}/messages/${messageId}/reactions/count`
    );
    return data;
  },

  addReaction: async (channelId: string, messageId: string, emoji: string) => {
    await apiClient.post(
      `/api/channels/${channelId}/messages/${messageId}/reactions`,
      { emoji }
    );
  },

  removeReaction: async (channelId: string, messageId: string, emoji: string) => {
    await apiClient.delete(
      `/api/channels/${channelId}/messages/${messageId}/reactions`,
      { data: { emoji } }
    );
  },

  getMessageReactions: async (channelId: string, messageId: string) => {
    const { data } = await apiClient.get(
      `/api/channels/${channelId}/messages/${messageId}/reactions`
    );
    return data;
  },
}; 