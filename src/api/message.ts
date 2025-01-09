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
    console.log('Raw response from backend:', data);
    console.log('Messages with files:', data.map(m => ({
      messageId: m.id,
      files: m.files
    })));
    return data;
  },

  createMessage: async (
    channelId: string,
    content: string,
    file?: File,
    onProgress?: (progress: number) => void,
    parentMessageId?: string
  ) => {
    const formData = new FormData();
    formData.append('content', content);
    if (parentMessageId) {
      formData.append('parentMessageId', parentMessageId);
    }
    if (file) {
      formData.append('file', file);
    }

    const { data } = await axiosInstance.post<Message>(
      `/api/channels/${channelId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...(file && onProgress ? {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        } : {})
      }
    );

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