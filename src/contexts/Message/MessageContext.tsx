import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { messageApi } from '../../api/message';
import { useWorkspace } from '../WorkspaceContext';
import type { Message } from '../../types/message';
import { reactionApi } from '../../api/reaction';
import { createSendMessage } from './messageServices/sendMessage';
import { createAddMessage } from './messageServices/addMessage';
interface MessageContextType {
  messages: Message[];
  threadMessages: Message[];
  setThreadMessages: (messages: Message[]) => void;
  getThreadMessages: (messageId: string) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, file?: File, onProgress?: (progress: number) => void, parentMessageId?: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateReactions: (messageId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export function MessageProvider({ children, user }: MessageProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentChannel } = useWorkspace();

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

  const sendMessage = useCallback(
    //content: string,
    //file?: File,
    //onProgress?: (progress: number) => void,
    //parentMessageId?: string
    createSendMessage({
      currentChannelId: currentChannel?.id,
      setThreadMessages,
      setMessages,
    }),
    [currentChannel?.id]
  );

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
      const targetMessage = messages.find(m => m.id === messageId);
      if (targetMessage) {
        const [reactionCounts, userReactions] = await Promise.all([
          reactionApi.getReactionCounts(targetMessage.channel_id, messageId),
          reactionApi.getMessageReactions(targetMessage.channel_id, messageId)
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

  // Used for real time messaging updates
  const addMessage = useCallback(
    //message: Message
    createAddMessage({
      setMessages,
      setThreadMessages,
    }),
    []
  );

  const updateReactions = useCallback(async (messageId: string) => {
    try {
      console.log('Updating reactions for message:', messageId);
      const message = messages.find(m => m.id === messageId);
      if (!message) {
        console.log('Message not found:', messageId);
        return;
      }

      const [reactionCounts, userReactions] = await Promise.all([
        reactionApi.getReactionCounts(message.channel_id, messageId),
        reactionApi.getMessageReactions(message.channel_id, messageId)
      ]);

      console.log('New reaction data:', { reactionCounts, userReactions });

      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: reactionCounts || {},
            userReactions: userReactions || []
          };
        }
        // Also update the message if it exists in any thread replies
        if (msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply => 
              reply.id === messageId 
                ? { ...reply, reactions: reactionCounts || {}, userReactions: userReactions || [] }
                : reply
            )
          };
        }
        return msg;
      }));
    } catch (err) {
      console.error('Failed to update reactions:', err);
    }
  }, [messages]);

  const getThreadMessages = useCallback(async (messageId: string) => {
    const threadMessages = await messageApi.getThreadMessages(messageId);
    setThreadMessages(threadMessages);
  }, []);

  const value = {
    messages,
    threadMessages,
    setThreadMessages,
    getThreadMessages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
    addMessage,
    updateReactions,
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