import { Message } from '../../../types/message';
import { doesMessageExist } from '../messageUtils/doesMessageExist';
import { updateMessageArray } from '../messageUtils/updateMessageArray';

interface AddMessageParams {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setThreadMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const createAddMessage = ({
  setMessages,
  setThreadMessages,
}: AddMessageParams) => {
  return (message: Message) => {
    setMessages(prev => {
      // Check if message already exists
      const messageExists = doesMessageExist(prev, message);

      if (messageExists) {
        // If message exists, just update it
        return updateMessageArray(prev, message);
      }

      // If message is a reply...
      if (message.parent_message_id) {
        // Update threadMessages state if this is a reply
        setThreadMessages(prev => {
          const replyExists = doesMessageExist(prev, message);
          if (replyExists) {
            return updateMessageArray(prev, message);
          }
          return [...prev, message];
        });

        // Update the replies in the main messages array
        return prev.map(msg => 
          msg.id !== message.parent_message_id ? msg : {
            ...msg,
            replies: doesMessageExist(msg.replies || [], message)
              ? updateMessageArray(msg.replies || [], message)
              : [...(msg.replies || []), message]
          }
        );
      }

      // Otherwise add to main messages array
      // new message from someone else
      return [...prev, message];
    });
  };
};
