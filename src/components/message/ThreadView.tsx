import { useMessage } from '../../contexts/MessageContext';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { useMemo, useRef, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface ThreadViewProps {
  parentMessageId: string;
  onClose: () => void;
}

export function ThreadView({ parentMessageId, onClose }: ThreadViewProps) {
  const { messages } = useMessage();
  const { currentWorkspace } = useWorkspace();
  const threadEndRef = useRef<HTMLDivElement>(null);

  const threadMessages = useMemo(() => {
    const parent = messages.find(m => m.id === parentMessageId);
    if (!parent) return [];
    
    const replies = messages.filter(m => m.parent_message_id === parentMessageId);
    
    return [parent, ...replies].sort((a, b) => {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [messages, parentMessageId]);

  const scrollToBottom = () => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!currentWorkspace) return null;

  return (
    <div className="flex flex-col h-full border-l border-text-secondary/20">
      <div className="p-4 border-b border-text-secondary/20 flex justify-between items-center">
        <h3 className="text-lg font-medium">Thread</h3>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary"
        >
          ✕
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {threadMessages.map(message => (
          <Message 
            key={message.id} 
            message={message}
            isInThread={true}
          />
        ))}
        <div ref={threadEndRef} />
      </div>

      <MessageInput 
        parentMessageId={parentMessageId}
        isThread={true}
        onMessageSent={scrollToBottom}
      />
    </div>
  );
} 