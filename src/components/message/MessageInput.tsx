import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { useMessage } from '../../contexts/Message/MessageContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { FileUploadButton } from '../file/FileUploadButton';
import { FileUploadProgress } from '../file/FileUploadProgress';
import { useMentions } from '../../hooks/useMentions';
import { Clone } from '../../types/clone';
import { MentionSuggestions } from './MentionSuggestions';

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
  const { sendMessage } = useMessage();
  const { currentWorkspace } = useWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const {
    suggestions,
    isLoading: loadingMentions,
    error: mentionsError,
    searchMentions,
    formatMessageWithMentions,
  } = useMentions();

  // Handle content changes and mention detection
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check for mention trigger
    const caretPosition = e.target.selectionStart || 0;
    const textBeforeCaret = newContent.substring(0, caretPosition);
    const atSymbolIndex = textBeforeCaret.lastIndexOf('@');

    if (atSymbolIndex !== -1 && atSymbolIndex < caretPosition) {
      const query = textBeforeCaret.substring(atSymbolIndex + 1);
      // Hide suggestions if there's a space in the query
      if (query.includes(' ')) {
        setShowMentions(false);
        return;
      }
      // Show suggestions immediately after @ and update as user types
      searchMentions(query);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, [searchMentions]);

  // Handle mention selection
  const handleMentionSelect = useCallback((clone: Clone) => {
    console.log('handleMentionSelect called with clone:', clone);
    if (!inputRef.current) return;
    console.log('inputRef.current:', inputRef.current);
    const caretPosition = inputRef.current.selectionStart || 0;
    const textBeforeCaret = content.substring(0, caretPosition);
    const atSymbolIndex = textBeforeCaret.lastIndexOf('@');
    console.log('atSymbolIndex:', atSymbolIndex);
    if (atSymbolIndex === -1) return;

    const newContent = 
      content.substring(0, atSymbolIndex) +
      `@${clone.name} ` +
      content.substring(caretPosition);

    console.log('Mention selected:', clone.name); // Log the selected mention
    console.log('New content after mention:', newContent); // Log the new content

    setContent(newContent);
    setShowMentions(false);

    // Focus back on input and place cursor after mention and space
    inputRef.current.focus();
    const newCursorPosition = atSymbolIndex + clone.name.length + 2; // +2 for @ and space
    inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
  }, [content]);

  // Close mentions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if the click is on a mention suggestion
      const target = e.target as HTMLElement;
      const isMentionSuggestion = target.closest('.mention-suggestions');
      if (!inputRef.current?.contains(e.target as Node) && !isMentionSuggestion) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = async (file: File) => {
    setUploadingFile({ file, progress: 0 });
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
    if ((!content.trim() && !uploadingFile) || !currentWorkspace) return;

    try {
      // Format message with mention IDs before sending
      const formattedContent = formatMessageWithMentions(content);

      await sendMessage(
        formattedContent,
        uploadingFile?.file,
        uploadingFile ? (progress) => {
          setUploadingFile(prev => prev ? { ...prev, progress } : null);
        } : undefined,
        parentMessageId
      );

      setContent('');
      setUploadingFile(null);
      if (onMessageSent) {
        onMessageSent();
      }
      inputRef.current?.focus();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to send message';
      if (uploadingFile) {
        setUploadingFile(prev => prev ? { ...prev, error } : null);
      }
      console.error('Failed to send message:', error);
    }
  };

  if (!currentWorkspace) {
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
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={content}
            onChange={handleContentChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && (content.trim() || uploadingFile?.progress === 100)) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isThread ? 'Reply in thread...' : `Message #${currentWorkspace.name}`}
            className="w-full bg-background-primary border border-text-secondary/20 rounded-lg 
              px-4 py-2 text-text-primary placeholder:text-text-secondary focus:outline-none 
              focus:border-accent-primary"
          />
          {showMentions && (
            <MentionSuggestions
              suggestions={suggestions}
              isLoading={loadingMentions}
              error={mentionsError}
              onSelect={handleMentionSelect}
              inputRef={inputRef}
            />
          )}
        </div>
        <button
          type="submit"
          disabled={!content.trim() && !uploadingFile?.file}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium
            hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isThread ? 'Reply' : 'Send'}
        </button>
      </div>
    </form>
  );
} 