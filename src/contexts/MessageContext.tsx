import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { messageApi } from '../api/message';
import { useChannel } from './ChannelContext';
import type { Message } from '../types/message';

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
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { currentChannel } = useChannel();
  const [channelMessages, setChannelMessages] = useState<ChannelMessages>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentChannel) return;

    const fetchMessages = async () => {
      setIsLoading(true);
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
      setChannelMessages(prev => ({
        ...prev,
        [currentChannel.id]: [...(prev[currentChannel.id] || []), newMessage]
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

  return (
    <MessageContext.Provider
      value={{
        messages,
        isLoading,
        error,
        sendMessage,
        updateMessage,
        deleteMessage,
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