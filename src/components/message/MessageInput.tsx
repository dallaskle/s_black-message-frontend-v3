import { useState, FormEvent, useRef } from 'react';
import { useMessage } from '../../contexts/MessageContext';
import { useChannel } from '../../contexts/ChannelContext';

interface MessageInputProps {
  parentMessageId?: string;
  isThread?: boolean;
  onMessageSent?: () => void;
}

export function MessageInput({ parentMessageId, isThread = false, onMessageSent }: MessageInputProps) {
  const [content, setContent] = useState('');
  const { sendMessage } = useMessage();
  const { currentChannel } = useChannel();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentChannel) return;

    try {
      await sendMessage(content, parentMessageId);
      setContent('');
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
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && content.trim()) {
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
          disabled={!content.trim()}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg font-medium
            hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isThread ? 'Reply' : 'Send'}
        </button>
      </div>
    </form>
  );
} 