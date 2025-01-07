import { useMessage } from '../../contexts/MessageContext';
import { useChannel } from '../../contexts/ChannelContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Message } from './Message';
import { MessageInput } from './MessageInput';

export function MessageList() {
  const { messages, isLoading, error } = useMessage();
  const { currentChannel } = useChannel();
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="p-4 text-text-secondary">
        Select a workspace to view messages
      </div>
    );
  }

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

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-4 text-text-secondary">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
      </div>
      <MessageInput />
    </div>
  );
} 