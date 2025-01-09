import axiosInstance from './axiosConfig';
import type { Message } from '../types/message';
import type { FileUploadResponse } from '../types/file';

// Update interface to use FileUploadResponse type
interface MessageWithFile {
  content: string;
  parentMessageId?: string;
  fileData?: FileUploadResponse;
}

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

  createMessage: async (
    channelId: string, 
    content: string, 
    parentMessageId?: string,
    fileData?: FileUploadResponse
  ) => {
    const { data } = await axiosInstance.post<Message>(
      `/api/channels/${channelId}/messages`,
      { content, parentMessageId, fileData }
    );

    if (!data.name) {
      try {
        const { data: userData } = await axiosInstance.get('/api/users/me');
        return { ...data, name: userData.name };
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    }

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