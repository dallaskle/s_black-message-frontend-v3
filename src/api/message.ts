import { apiClient } from './client';
import type { Message } from '../types/message';

export const messageApi = {
  getChannelMessages: async (channelId: string, params?: {
    limit?: number;
    before?: string;
  }) => {
    const { data } = await apiClient.get<Message[]>(
      `/api/channels/${channelId}/messages`,
      { params }
    );
    return data;
  },

  createMessage: async (channelId: string, content: string, parentMessageId?: string) => {
    console.log('parentMessageId:', parentMessageId);
    const { data } = await apiClient.post<Message>(
      `/api/channels/${channelId}/messages`,
      { content, parentMessageId }
    );

    /*if (!data.name) {
      const { data: userData } = await apiClient.get('/api/users/me');
      return {
        ...data,
        name: userData.name
      };
    }*/

    return data;
  },

  updateMessage: async (messageId: string, content: string) => {
    const { data } = await apiClient.patch<Message>(
      `/api/messages/${messageId}`,
      { content }
    );
    return data;
  },

  deleteMessage: async (messageId: string) => {
    await apiClient.delete(`/api/messages/${messageId}`);
  },

  getThreadMessages: async (messageId: string, params?: {
    limit?: number;
    before?: string;
  }) => {
    const { data } = await apiClient.get<Message[]>(
      `/api/messages/${messageId}/thread`,
      { params }
    );
    return data;
  },
}; 