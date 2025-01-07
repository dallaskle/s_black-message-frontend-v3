import { useMessage } from '../../contexts/MessageContext';
import { useChannel } from '../../contexts/ChannelContext';
import { Message } from './Message';

export function MessageList() {
  const { messages, isLoading, error } = useMessage();
  const { currentChannel } = useChannel();

  if (!currentChannel) {
    return (
      <div className="p-4 text-text-secondary">
        Select a channel to view messages
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-text-secondary">
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-accent-error">
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="p-4 text-text-secondary">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
} 