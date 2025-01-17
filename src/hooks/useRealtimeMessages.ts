import { useEffect } from 'react';
import { useMessage } from '../contexts/Message/MessageContext';
import { realtimeService } from '../lib/realtimeService';
import { MessageStatus } from '../types/message';

export const useRealtimeMessages = (channelId: string | undefined) => {
  const { addMessage, updateMessage, deleteMessage, updateReactions } = useMessage();

  useEffect(() => {
    if (!channelId) return;

    try {
      // Subscribe to regular messages
      realtimeService.subscribeToMessages(channelId, ({ eventType, message }) => {
        // Ensure message has files property
        const messageWithFiles = {
          ...message,
          files: message.files || []
        };

        console.log('eventType', eventType);

        switch (eventType) {
          case 'INSERT':
            addMessage(messageWithFiles);
            break;
          case 'UPDATE':
            console.log('realtime message', messageWithFiles);
            if (messageWithFiles.status === MessageStatus.Deleted ) {
              console.log('realtime deleting message', messageWithFiles);
              deleteMessage(messageWithFiles, true);
            } else {
              console.log('realtime updating message', messageWithFiles);
              updateMessage(messageWithFiles, true);
            }
            break;
        }
      });

      // Subscribe to clone messages
      realtimeService.subscribeToCloneMessages(channelId, ({ eventType, message }) => {
        // Clone messages are treated similarly to regular messages
        const messageWithFiles = {
          ...message,
          files: message.files || [],
          is_clone_message: true // Add a flag to identify clone messages
        };

        console.log('clone message eventType', eventType);

        switch (eventType) {
          case 'INSERT':
            addMessage(messageWithFiles);
            break;
          case 'UPDATE':
            console.log('realtime clone message', messageWithFiles);
            if (messageWithFiles.status === MessageStatus.Deleted) {
              console.log('realtime deleting clone message', messageWithFiles);
              deleteMessage(messageWithFiles, true);
            } else {
              console.log('realtime updating clone message', messageWithFiles);
              updateMessage(messageWithFiles, true);
            }
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