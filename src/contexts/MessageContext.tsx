import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { messageApi } from '../api/message';
import { useChannel } from './ChannelContext';
import type { Message } from '../types/message';
import { reactionApi } from '../api/reaction';

interface MessageContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, parentMessageId?: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentChannel } = useChannel();

  // Fetch messages for current channel
  useEffect(() => {
    if (!currentChannel?.id) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get all channel messages first
        const channelMessages = await messageApi.getChannelMessages(currentChannel.id);
        
        // Find messages that have replies (are thread parents)
        const threadParents = channelMessages.filter(msg => 
          channelMessages.some(reply => reply.parent_message_id === msg.id)
        );
        
        // Fetch thread messages for each parent
        const messagesWithThreads = await Promise.all(
          channelMessages.map(async (message) => {
            if (threadParents.some(parent => parent.id === message.id)) {
              // This is a thread parent, fetch its thread messages
              const threadMessages = await messageApi.getThreadMessages(message.id);
              return { ...message, replies: threadMessages };
            }
            return message;
          })
        );

        setMessages(messagesWithThreads);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [currentChannel?.id]);

  const sendMessage = useCallback(async (content: string, parentMessageId?: string) => {
    if (!currentChannel?.id) return;

    try {
      // Create the message with parent_message_id if in a thread
      const newMessage = await messageApi.createMessage(
        currentChannel.id, 
        content,
        parentMessageId // This is being passed correctly
      );
      
      if (parentMessageId) {
        // Update messages array to include the new reply
        setMessages(prev => prev.map(msg => {
          if (msg.id === parentMessageId) {
            // Add to parent message's replies
            return {
              ...msg,
              replies: [...(msg.replies || []), newMessage]
            };
          }
          // Also check if this message exists in any other thread's replies
          if (msg.replies) {
            return {
              ...msg,
              replies: msg.replies.map(reply => 
                reply.id === parentMessageId
                  ? { ...reply, replies: [...(reply.replies || []), newMessage] }
                  : reply
              )
            };
          }
          return msg;
        }));
      } else {
        // Add new message to the main messages array
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [currentChannel?.id]);

  const updateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const updatedMessage = await messageApi.updateMessage(messageId, content);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? updatedMessage : msg
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update message');
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await messageApi.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  }, []);

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const hasReacted = message.userReactions?.includes(emoji);
      
      if (hasReacted) {
        await reactionApi.removeReaction(message.channel_id, messageId, emoji);
      } else {
        await reactionApi.addReaction(message.channel_id, messageId, emoji);
      }

      // Get updated reaction counts
      const reactionCounts = await reactionApi.getReactionCounts(message.channel_id, messageId);
      // Get updated user reactions
      const userReactions = await reactionApi.getMessageReactions(message.channel_id, messageId);

      // Update both the main messages and any thread replies
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: reactionCounts,
            userReactions
          };
        }
        // Also update the message if it exists in any thread replies
        if (msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply => 
              reply.id === messageId 
                ? { ...reply, reactions: reactionCounts, userReactions }
                : reply
            )
          };
        }
        return msg;
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle reaction');
    }
  }, [messages]);

  const value = {
    messages,
    isLoading,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
    toggleReaction
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
} 