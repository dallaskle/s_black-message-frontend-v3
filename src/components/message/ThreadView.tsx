import { useMessage } from '../../contexts/Message/MessageContext';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { useRef, useEffect } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface ThreadViewProps {
  parentMessageId: string;
  onClose: () => void;
}

export function ThreadView({ parentMessageId, onClose }: ThreadViewProps) {
  const { messages, getThreadMessages, threadMessages, setThreadMessages } = useMessage();
  const { currentWorkspace } = useWorkspace();
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Find the parent message
  const parentMessage = messages.find(message => message.id === parentMessageId);

  console.log(threadMessages);

  useEffect(() => {
    setThreadMessages([]);
    getThreadMessages(parentMessageId);
    
    // Cleanup function
    return () => {
      setThreadMessages([]);
    };
  }, [parentMessageId]);

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
        {parentMessage && (
          <Message 
            key={parentMessage.id} 
            message={parentMessage}
            isInThread={true}
          />
        )}
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