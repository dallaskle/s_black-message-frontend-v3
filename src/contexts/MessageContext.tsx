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

    // Create optimistic message
    const optimisticMessage = {
      id: `temp-${Date.now()}`, // temporary ID
      content,
      channel_id: currentChannel.id,
      parent_message_id: parentMessageId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'current-user', // You'll need to get this from your auth context
      reactions: {},
      userReactions: []
    };

    // Optimistically update UI
    setMessages(prev => {
      const newMessages = [...prev];
      
      // Add to main messages array
      newMessages.push(optimisticMessage);
      
      // If this is a thread reply, update the parent's replies
      if (parentMessageId) {
        return newMessages.map(msg => {
          if (msg.id === parentMessageId) {
            return {
              ...msg,
              replies: [...(msg.replies || []), optimisticMessage]
            };
          }
          return msg;
        });
      }
      
      return newMessages;
    });

    try {
      // Make API call
      const savedMessage = await messageApi.createMessage(
        currentChannel.id, 
        content,
        parentMessageId
      );

      // Replace optimistic message with saved message
      setMessages(prev => prev.map(msg => {
        if (msg.id === optimisticMessage.id) {
          return savedMessage;
        }
        if (msg.id === parentMessageId) {
          return {
            ...msg,
            replies: (msg.replies || []).map(reply => 
              reply.id === optimisticMessage.id ? savedMessage : reply
            )
          };
        }
        return msg;
      }));

    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
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
      
      // Optimistically update the UI
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          // Calculate optimistic reaction counts
          const newReactions = { ...msg.reactions };
          newReactions[emoji] = (newReactions[emoji] || 0) + (hasReacted ? -1 : 1);
          if (newReactions[emoji] <= 0) {
            delete newReactions[emoji];
          }

          // Update user reactions
          const newUserReactions = hasReacted
            ? msg.userReactions.filter(r => r !== emoji)
            : [...(msg.userReactions || []), emoji];

          return {
            ...msg,
            reactions: newReactions,
            userReactions: newUserReactions
          };
        }
        // Also update the message if it exists in any thread replies
        if (msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply => {
              if (reply.id === messageId) {
                // Calculate optimistic reaction counts for reply
                const newReactions = { ...reply.reactions };
                newReactions[emoji] = (newReactions[emoji] || 0) + (hasReacted ? -1 : 1);
                if (newReactions[emoji] <= 0) {
                  delete newReactions[emoji];
                }

                // Update user reactions for reply
                const newUserReactions = hasReacted
                  ? reply.userReactions.filter(r => r !== emoji)
                  : [...(reply.userReactions || []), emoji];

                return {
                  ...reply,
                  reactions: newReactions,
                  userReactions: newUserReactions
                };
              }
              return reply;
            })
          };
        }
        return msg;
      }));

      // Make API call
      if (hasReacted) {
        await reactionApi.removeReaction(message.channel_id, messageId, emoji);
      } else {
        await reactionApi.addReaction(message.channel_id, messageId, emoji);
      }

      // Get actual updated data from server
      const [reactionCounts, userReactions] = await Promise.all([
        reactionApi.getReactionCounts(message.channel_id, messageId),
        reactionApi.getMessageReactions(message.channel_id, messageId)
      ]);

      // Update with actual server data
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
      // Revert optimistic update on error by refetching the current state
      if (message) {
        const [reactionCounts, userReactions] = await Promise.all([
          reactionApi.getReactionCounts(message.channel_id, messageId),
          reactionApi.getMessageReactions(message.channel_id, messageId)
        ]);

        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, reactions: reactionCounts, userReactions };
          }
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
      }
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