import axiosInstance from './axiosConfig';
import type { FileUploadResponse } from '../types/file';

export const fileApi = {
  // Upload a file and get back the URL
  uploadFile: async (
    channelId: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> => {
    // Log type checks for the file
    if (!(file instanceof File)) {
      console.error('The provided file is not a valid File object.');
      throw new Error('Invalid file type');
    }
    
    if (file.size === 0) {
      console.error('The provided file is empty.');
      throw new Error('File is empty');
    }

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await axiosInstance.post<FileUploadResponse>(
      `/api/channels/${channelId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );

    return data;
  },

  // Delete a file
  deleteFile: async (channelId: string, fileId: string): Promise<void> => {
    await axiosInstance.delete(`/api/channels/${channelId}/files/${fileId}`);
  }
};
