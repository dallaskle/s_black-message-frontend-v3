import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { messageApi } from '../api/message';
import { useChannel } from './ChannelContext';
import type { Message } from '../types/message';
import { reactionApi } from '../api/reaction';

interface ChannelMessages {
  [channelId: string]: Message[];
}

interface MessageContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { currentChannel } = useChannel();
  const [channelMessages, setChannelMessages] = useState<ChannelMessages>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear messages when workspace changes
  useEffect(() => {
    setChannelMessages({});
  }, [currentChannel?.workspace_id]);

  // Modify the channel change effect to clear messages first
  useEffect(() => {
    if (!currentChannel) {
      setChannelMessages({}); // Clear messages when no channel is selected
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      // Clear existing messages for this channel before fetching
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel.id]: [] // Clear messages for this channel
      }));
      
      try {
        const data = await messageApi.getChannelMessages(currentChannel.id);
        setChannelMessages(prev => ({
          ...prev,
          [currentChannel.id]: data
        }));
        setError(null);
      } catch (err) {
        setError('Failed to fetch messages');
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [currentChannel?.id]);

  const messages = currentChannel 
    ? channelMessages[currentChannel.id] || []
    : [];

  const sendMessage = async (content: string) => {
    if (!currentChannel) return;
    
    try {
      const newMessage = await messageApi.createMessage(currentChannel.id, content);
      const messageWithReactions = {
        ...newMessage,
        reactions: {},
        userReactions: []
      };
      
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel.id]: [...(prev[currentChannel.id] || []), messageWithReactions]
      }));
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  const updateMessage = async (messageId: string, content: string) => {
    if (!currentChannel) return;

    try {
      const updatedMessage = await messageApi.updateMessage(messageId, content);
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel.id]: prev[currentChannel.id].map(msg =>
          msg.id === messageId ? updatedMessage : msg
        )
      }));
    } catch (err) {
      console.error('Error updating message:', err);
      throw err;
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentChannel) return;

    try {
      await messageApi.deleteMessage(messageId);
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel.id]: prev[currentChannel.id].filter(msg => msg.id !== messageId)
      }));
    } catch (err) {
      console.error('Error deleting message:', err);
      throw err;
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!currentChannel) return;

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const hasReacted = message.userReactions.includes(emoji);

      if (hasReacted) {
        await reactionApi.removeReaction(currentChannel.id, messageId, emoji);
      } else {
        await reactionApi.addReaction(currentChannel.id, messageId, emoji);
      }

      // Update message reactions in state
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel.id]: prev[currentChannel.id].map(msg => {
          if (msg.id === messageId) {
            const newCount = (msg.reactions[emoji] || 0) + (hasReacted ? -1 : 1);
            const newUserReactions = hasReacted
              ? msg.userReactions.filter(e => e !== emoji)
              : [...msg.userReactions, emoji];

            return {
              ...msg,
              reactions: {
                ...msg.reactions,
                [emoji]: newCount
              },
              userReactions: newUserReactions
            };
          }
          return msg;
        })
      }));
    } catch (err) {
      console.error('Error toggling reaction:', err);
      throw err;
    }
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
        updateMessage,
        deleteMessage,
        toggleReaction,
      }}
    >
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