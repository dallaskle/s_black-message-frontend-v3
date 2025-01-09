import { useEffect } from 'react';
import { useMessage } from '../contexts/MessageContext';
import { realtimeService } from '../lib/realtimeService';

export const useRealtimeMessages = (channelId: string | undefined) => {
  const { addMessage, updateMessage, deleteMessage, updateReactions } = useMessage();

  useEffect(() => {
    if (!channelId) return;

    try {
      // Subscribe to messages
      realtimeService.subscribeToMessages(channelId, ({ eventType, message }) => {
        // Ensure message has files property
        const messageWithFiles = {
          ...message,
          files: message.files || []
        };

        switch (eventType) {
          case 'INSERT':
            addMessage(messageWithFiles);
            break;
          case 'UPDATE':
            updateMessage(messageWithFiles.id, messageWithFiles.content);
            break;
          case 'DELETE':
            deleteMessage(messageWithFiles.id);
            break;
        }
      });

      // Subscribe to reactions
      /*realtimeService.subscribeToReactions(channelId, ({ eventType, reaction }) => {
        if (reaction && reaction.message_id) {
          updateReactions(reaction.message_id);
        }
      });*/
    } catch (error) {
      console.error('Error setting up realtime subscriptions:', error);
    }

    // Cleanup subscriptions on unmount or channel change
    return () => {
      try {
        realtimeService.unsubscribe(channelId);
      } catch (error) {
        console.error('Error cleaning up realtime subscriptions:', error);
      }
    };
  }, [channelId, addMessage, updateMessage, deleteMessage, updateReactions]);
}; 