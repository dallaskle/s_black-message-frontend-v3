import { useMessage } from '../../../contexts/Message/MessageContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { Message } from '../Message';
import { MessageInput } from '../MessageInput';
import { useMemo, useRef, useEffect, useState } from 'react';
import { ThreadView } from './ThreadView';

// Helper function to get date group label
const getDateGroup = (date: Date): string => {
  const now = new Date();
  
  // Set both dates to start of day in local time
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffDays = Math.floor((startOfToday.getTime() - startOfMessageDay.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  if (diffDays < 30) return 'Last Week';
  return 'Last Month';
};

interface MessageGroup {
  label: string;
  messages: Array<any>; // Replace 'any' with your Message type
}

export function MessageList() {
  const { messages, isLoading, error } = useMessage();
  const { currentWorkspace } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Close thread when switching channels or workspaces
  useEffect(() => {
    setActiveThreadId(null);
  }, [currentWorkspace?.id]);

  // Filter out messages that are replies
  const parentMessages = useMemo(() => {
    return messages.filter(message => !message.parent_message_id);
  }, [messages]);

  // Group and sort messages
  const groupedMessages = useMemo(() => {
    // First sort messages by creation date
    const sortedMessages = [...parentMessages].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateA.getTime() - dateB.getTime();
    });

    // Group messages by date
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    sortedMessages.forEach(message => {
      const date = new Date(message.created_at);
      const dateGroup = getDateGroup(date);

      if (!currentGroup || currentGroup.label !== dateGroup) {
        currentGroup = { label: dateGroup, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(message);
    });

    return groups;
  }, [parentMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentWorkspace) {
    return (
      <div className="p-4 text-text-secondary">
        Select a workspace to view messages
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
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main message list */}
      <div className={`flex flex-col ${activeThreadId ? 'w-7/12' : 'w-full'}`}>
        <div className="flex-1 overflow-y-auto px-4">
          {messages.length === 0 ? (
            <div className="py-4 text-text-secondary">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <>
              {groupedMessages.map((group, index) => (
                <div key={group.label}>
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-text-secondary/20"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-background-primary text-text-secondary text-sm">
                        {group.label}
                      </span>
                    </div>
                  </div>
                  {group.messages.map((message) => (
                    <Message 
                      key={message.id} 
                      message={message}
                      onThreadClick={setActiveThreadId}
                    />
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        <MessageInput />
      </div>

      {/* Thread view */}
      {activeThreadId && (
        <div className="w-5/12">
          <ThreadView
            parentMessageId={activeThreadId}
            onClose={() => setActiveThreadId(null)}
          />
        </div>
      )}
    </div>
  );
} 