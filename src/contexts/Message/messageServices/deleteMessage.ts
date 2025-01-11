import { messageApi } from '../../../api/message';
import { Message, MessageStatus } from '../../../types/message';
import { Dispatch, SetStateAction } from 'react';

interface DeleteMessageDeps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

export const createDeleteMessage = ({
  setMessages,
  setError,
}: DeleteMessageDeps) => {
  return async (message: Message, skipApi: boolean = false) => {
    try {
      // Only make API call if not from realtime update
      if (!skipApi) {
        const updatedMessage = {
          ...message,
          status: MessageStatus.Deleted
        }
        console.log('Updated message:', updatedMessage);
        await messageApi.updateMessage(message.id, updatedMessage);
        console.log('Deleted message:', message);
        messageApi.deleteMessage(updatedMessage.id);
      }

      // Update messages in state, including any thread replies
      setMessages(prev => prev.filter(msg => {
        // Remove the message if it matches the deleted message id
        if (msg.id === message.id) {
          return false;
        }
        // If message has replies, filter out the deleted message from replies
        if (msg.replies) {
          msg.replies = msg.replies.filter(reply => reply.id !== message.id);
        }
        return true;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete message';
      setError(errorMessage);
      if (!skipApi) {
        throw err; // Only throw error for user-initiated deletes
      }
    }
  };
};
