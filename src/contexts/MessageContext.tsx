import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { messageApi } from '../api/message';
import { useChannel } from './ChannelContext';
import type { FileAttachment, Message } from '../types/message';
import { reactionApi } from '../api/reaction';
import { fileApi } from '../api/file';

interface MessageContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, parentMessageId?: string, file?: File | null) => Promise<void>;
  updateMessage: (messageId: string, content: string, file?: FileAttachment | undefined) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateReactions: (messageId: string) => Promise<void>;
  uploadProgress: Record<string, number>;
  uploadErrors: Record<string, string>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

interface MessageProviderProps {
  children: React.ReactNode;
  user: {
    id: string;
    name: string;
  } | null;
}

export function MessageProvider({ children, user }: MessageProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentChannel } = useChannel();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

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

  const sendMessage = useCallback(async (
    content: string,
    parentMessageId?: string,
    file?: File | null
  ) => {
    if (!currentChannel?.id) return;

    const tempId = `temp-${Date.now()}`;

    // Create optimistic message
    const optimisticMessage = {
      id: tempId,
      content,
      channel_id: currentChannel.id,
      parent_message_id: parentMessageId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user?.id || 'current-user',
      name: user?.name || 'User',
      reactions: {},
      userReactions: []
    };

    // Add to messages immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Create the message first
      const savedMessage = await messageApi.createMessage(
        currentChannel.id,
        content,
        parentMessageId
      );

      let fileData = null;
      if (file) {
        try {
          setUploadProgress(prev => ({ ...prev, [tempId]: 0 }));
          fileData = await fileApi.uploadFile(
            currentChannel.id,
            savedMessage.id,
            file,
            (progress) => {
              setUploadProgress(prev => ({ ...prev, [tempId]: progress }));
            }
          );
        } catch (err) {
          setUploadErrors(prev => ({
            ...prev,
            [tempId]: err instanceof Error ? err.message : 'Failed to upload file'
          }));
          throw err;
        } finally {
          setUploadProgress(prev => {
            const { [tempId]: _, ...rest } = prev;
            return rest;
          });
          setUploadErrors(prev => {
            const { [tempId]: _, ...rest } = prev;
            return rest;
          });
        }
      }

      // Update message with file data
      const finalMessage = {
        ...savedMessage,
        file: fileData || undefined
      };

      // Replace optimistic message
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? finalMessage : msg
      ));

    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      throw err;
    }
  }, [currentChannel?.id, user]);

  const updateMessage = useCallback(async (
    messageId: string, 
    content: string,
    file?: FileAttachment
  ) => {
    try {
      const updatedMessage = await messageApi.updateMessage(messageId, content);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...updatedMessage, file: file || msg.file } : msg
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

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check if message already exists
      const messageExists = prev.some(m => m.id === message.id || 
        (m.id.startsWith('temp-') && m.content === message.content));

      if (messageExists) {
        // If message exists, just update it (in case server added more data)
        return prev.map(m => {
          if (m.id === message.id || 
            (m.id.startsWith('temp-') && m.content === message.content)) {
            return {
              ...message,
              // Keep existing name if the new message doesn't have one
              name: message.name || m.name
            };
          }
          return m;
        });
      }

      // If message is a reply...
      if (message.parent_message_id) {
        return prev.map(msg => {
          if (msg.id === message.parent_message_id) {
            const replyExists = msg.replies?.some(r => 
              r.id === message.id || 
              (r.id.startsWith('temp-') && r.content === message.content)
            );

            if (replyExists) {
              return {
                ...msg,
                replies: msg.replies?.map(r => 
                  (r.id === message.id || 
                    (r.id.startsWith('temp-') && r.content === message.content))
                    ? { ...message, name: message.name || r.name }
                    : r
                )
              };
            }

            return {
              ...msg,
              replies: [...(msg.replies || []), message]
            };
          }
          return msg;
        });
      }

      // Otherwise add to main messages array
      return [...prev, message];
    });
  }, []);

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

  const value = {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
    addMessage,
    updateReactions,
    uploadProgress,
    uploadErrors
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