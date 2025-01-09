import { useState, FormEvent, useRef } from 'react';
import { useMessage } from '../../contexts/MessageContext';
import { useChannel } from '../../contexts/ChannelContext';
import { FileUploadButton } from '../file/FileUploadButton';
import { FileUploadProgress } from '../file/FileUploadProgress';

interface MessageInputProps {
  parentMessageId?: string;
  isThread?: boolean;
  onMessageSent?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export function MessageInput({ parentMessageId, isThread = false, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
  const { sendMessage, sendMessageWithFile } = useMessage();
  const { currentChannel } = useChannel();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setUploadingFile({ file, progress: 0 });
    
    try {
      await sendMessageWithFile(
        content,
        file,
        (progress) => {
          setUploadingFile(prev => prev ? { ...prev, progress } : null);
        },
        parentMessageId
      );
      
      setContent('');
      setUploadingFile(null);
      if (onMessageSent) {
        onMessageSent();
      }
      inputRef.current?.focus();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to upload file';
      setUploadingFile(prev => prev ? { ...prev, error } : null);
    }
  };

  const handleFileError = (error: string) => {
    setUploadingFile(prev => prev ? { ...prev, error } : null);
  };

  const handleCancelUpload = () => {
    // TODO: Implement cancellation token for axios request
    setUploadingFile(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !uploadingFile) || !currentChannel) return;

    try {
      // TODO: Modify sendMessage to handle file attachments
      await sendMessage(content, parentMessageId);
      setContent('');
      setUploadingFile(null);
      if (onMessageSent) {
        onMessageSent();
      }
      // Focus back on input after sending
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!currentChannel) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className={`flex-shrink-0 p-4 ${!isThread ? 'border-t' : ''} border-text-secondary/10 bg-background-primary`}>
      {uploadingFile && (
        <div className="mb-2">
          <FileUploadProgress
            fileName={uploadingFile.file.name}
            progress={uploadingFile.progress}
            error={uploadingFile.error}
            onCancel={handleCancelUpload}
          />
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex items-center">
          <FileUploadButton
            onFileSelect={handleFileSelect}
            onError={handleFileError}
            disabled={!!uploadingFile}
          />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && (content.trim() || uploadingFile?.progress === 100)) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder={isThread ? 'Reply in thread...' : `Message #${currentChannel.name}`}
          className="flex-1 bg-background-primary border border-text-secondary/20 rounded-lg 
            px-4 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none 
            focus:border-accent-primary"
        />
        <button
          type="submit"
          disabled={!content.trim() && (!uploadingFile || uploadingFile.progress !== 100)}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium
            hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isThread ? 'Reply' : 'Send'}
        </button>
      </div>
    </form>
  );
} 