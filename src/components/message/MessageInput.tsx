import { useState, FormEvent } from 'react';
import { useMessage } from '../../contexts/MessageContext';
import { useChannel } from '../../contexts/ChannelContext';
import { Button } from '../ui/Button';
import { FileUploadButton } from '../file/FileUploadButton';
import { FileUploadProgress } from '../file/FileUploadProgress';

interface MessageInputProps {
  parentMessageId?: string;
  isThread?: boolean;
  onMessageSent?: () => void;
}

export function MessageInput({ parentMessageId, isThread = false, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { sendMessage, uploadProgress } = useMessage();
  const { currentChannel } = useChannel();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleFileError = (error: string) => {
    setUploadError(error);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !selectedFile) || !currentChannel) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      await sendMessage(content, parentMessageId, selectedFile);
      setContent('');
      setSelectedFile(null);
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Failed to send message:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentChannel) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className={`flex-shrink-0 p-4 ${!isThread ? 'border-t' : ''} border-text-secondary/10 bg-background-primary`}>
      <div className="flex flex-col gap-2">
        {selectedFile && (
          <FileUploadProgress
            fileName={selectedFile.name}
            progress={uploadProgress[selectedFile.name] || 0}
            error={uploadError || undefined}
            onCancel={() => {
              setSelectedFile(null);
              setUploadError(null);
            }}
          />
        )}

        <div className="flex gap-2">
          <FileUploadButton
            onFileSelect={handleFileSelect}
            onError={handleFileError}
            disabled={isUploading}
          />
          <div className="flex-1 flex flex-col gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && (content.trim() || selectedFile)) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={isThread ? 'Reply in thread...' : `Message #${currentChannel.name}`}
              className="flex-1 bg-background-primary border border-text-secondary/20 rounded-lg 
                px-4 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none 
                focus:border-accent-primary"
              disabled={isUploading}
            />
          </div>
          <Button
            type="submit"
            disabled={(!content.trim() && !selectedFile) || isUploading}
            className="px-4 py-2"
          >
            {isUploading ? 'Sending...' : isThread ? 'Reply' : 'Send'}
          </Button>
        </div>
      </div>
    </form>
  );
} 