import axiosInstance from './axiosConfig';
import type { Message } from '../types/message';

export const messageApi = {
  getChannelMessages: async (channelId: string, params?: {
    limit?: number;
    before?: string;
  }) => {
    const { data } = await axiosInstance.get<Message[]>(
      `/api/channels/${channelId}/messages`,
      { params }
    );
    return data;
  },

  createMessage: async (channelId: string, content: string, parentMessageId?: string) => {
    console.log('parentMessageId:', parentMessageId);
    const { data } = await axiosInstance.post<Message>(
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
    const { data } = await axiosInstance.patch<Message>(
      `/api/messages/${messageId}`,
      { content }
    );
    return data;
  },

  deleteMessage: async (messageId: string) => {
    await axiosInstance.delete(`/api/messages/${messageId}`);
  },

  getThreadMessages: async (messageId: string, params?: {
    limit?: number;
    before?: string;
  }) => {
    const { data } = await axiosInstance.get<Message[]>(
      `/api/messages/${messageId}/thread`,
      { params }
    );
    return data;
  },
}; 