import { messageApi } from '../../../api/message';
import type { Message } from '../../../types/message';
import { Dispatch, SetStateAction } from 'react';

interface UpdateMessageDeps {
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setError: Dispatch<SetStateAction<string | null>>;
}

export const createUpdateMessage = ({ setMessages, setError }: UpdateMessageDeps) => {
  return async (message: Message, skipApi: boolean = false) => {
    try {
      let finalMessage: Message;

      if (!skipApi) {
        // For user-initiated updates, make the API call
        finalMessage = await messageApi.updateMessage(message.id, message.content);
      } else {
        // For realtime updates, use the provided message directly
        finalMessage = message;
      }

      // Update messages in state, including any thread replies
      setMessages(prev => prev.map(msg => {
        if (msg.id === message.id) {
          return { ...msg, ...finalMessage };
        }
        // Also update the message if it exists in any thread replies
        if (msg.replies) {
          return {
            ...msg,
            replies: msg.replies.map(reply =>
              reply.id === message.id
                ? { ...reply, ...finalMessage }
                : reply
            )
          };
        }
        return msg;
      }));

      return finalMessage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update message';
      setError(errorMessage);
      throw err;
    }
  };
};
