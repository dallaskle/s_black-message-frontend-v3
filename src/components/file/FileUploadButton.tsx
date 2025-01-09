import { useRef, ChangeEvent } from 'react';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { formatFileSize } from '../../types/file';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = {
  'image/*': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'video/*': ['video/mp4', 'video/webm', 'video/ogg'],
  'application/*': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain'
  ]
};

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  maxSize?: number;
}

export function FileUploadButton({
  onFileSelect,
  onError,
  disabled = false,
  maxSize = MAX_FILE_SIZE
}: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }
    // Check file type
    const isAllowedType = Object.values(ALLOWED_FILE_TYPES).flat().includes(file.type);
    if (!isAllowedType) {
      return 'File type not supported';
    }
    return null;
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      onError?.(error);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    onFileSelect(file);
  };
  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-text-secondary hover:text-text-primary rounded-lg 
          hover:bg-background-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        title="Attach file (max 100MB)"
      >
        <PaperClipIcon className="w-5 h-5" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={Object.values(ALLOWED_FILE_TYPES).flat().join(',')}
      />
    </>
  );
} 
