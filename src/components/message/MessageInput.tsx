import { useState, FormEvent } from 'react';
import { useMessage } from '../../contexts/MessageContext';
import { useChannel } from '../../contexts/ChannelContext';

export function MessageInput() {
  const [content, setContent] = useState('');
  const { sendMessage } = useMessage();
  const { currentChannel } = useChannel();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentChannel) return;

    try {
      await sendMessage(content);
      setContent(''); // Clear input after sending
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!currentChannel) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t border-text-secondary/10 bg-background-primary">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message #${currentChannel.name}`}
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
          Send
        </button>
      </div>
    </form>
  );
} 