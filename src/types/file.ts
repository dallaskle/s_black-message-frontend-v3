export interface File {
  id: string;
  channel_id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  thumbnail_url?: string;
  uploaded_at: string;
}

// Response type for file upload
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
  file_id: string;
}

// Type for file upload request payload
export interface FileUploadRequest {
  file: File;
  channelId: string;
}

// Type for file deletion request payload
export interface FileDeleteRequest {
  fileId: string;
  channelId: string;
}

// Helper type to determine if a file is an image
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

// Helper type to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
