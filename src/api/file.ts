import axiosInstance from './axiosConfig';
import type { FileAttachment } from '../types/message';

export const fileApi = {
  async uploadFile(
    channelId: string,
    messageId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('channelId', channelId);
    formData.append('messageId', messageId);

    const { data } = await axiosInstance.post<FileAttachment>(
      '/api/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.(percentCompleted);
          }
        },
      }
    );
    return data;
  },

  async getFileUrl(fileId: string): Promise<string> {
    const { data } = await axiosInstance.get<{ url: string }>(
      `/api/files/${fileId}/url`
    );
    return data.url;
  },

  async deleteFile(fileId: string): Promise<void> {
    await axiosInstance.delete(`/api/files/${fileId}`);
  },
}; 