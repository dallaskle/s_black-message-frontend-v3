import { useState, useEffect } from 'react';
import { DocumentIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import type { FileAttachment } from '../../types/message';
import { fileApi } from '../../api/file';

interface FilePreviewProps {
  file: FileAttachment;
  onClose?: () => void;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return <PhotoIcon className="w-5 h-5" />;
  } else if (fileType.startsWith('video/')) {
    return <VideoCameraIcon className="w-5 h-5" />;
  }
  return <DocumentIcon className="w-5 h-5" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(1) + ' MB';
  const gb = mb / 1024;
  return gb.toFixed(1) + ' GB';
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isImage = file.file_type.startsWith('image/');
  const isVideo = file.file_type.startsWith('video/');

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setIsLoading(true);
        const url = await fileApi.getFileUrl(file.id);
        setPreviewUrl(url);
      } catch (err) {
        setError('Failed to load preview');
        console.error('Failed to load preview:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isImage || isVideo) {
      loadPreview();
    }
  }, [file.id, isImage, isVideo]);

  if (!isImage && !isVideo) {
    return null;
  }

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-background-secondary rounded-lg" />;
  }

  if (error || !previewUrl) {
    return <div className="text-accent-error text-sm">{error}</div>;
  }

  return (
    <div className="relative group">
      {isImage ? (
        <img
          src={previewUrl}
          alt={file.file_name}
          className="max-h-48 rounded-lg object-cover"
        />
      ) : (
        <video
          src={previewUrl}
          controls
          className="max-h-48 rounded-lg"
        />
      )}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white 
            opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
} 