import { messageApi } from '../../../api/message';
import { Message } from '../../../types/message';
import { createOptimisticMessage } from '../messageUtils/addMessageToArray';

interface SendMessageDependencies {
  currentChannelId: string | undefined;
  setThreadMessages: (updater: (prev: Message[]) => Message[]) => void;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
}

export const createSendMessage = ({
  currentChannelId,
  setThreadMessages,
  setMessages,
}: SendMessageDependencies) => {
  return async (
    content: string,
    file?: File,
    onProgress?: (progress: number) => void,
    parentMessageId?: string
  ) => {
    if (!currentChannelId) return;

    const optimisticMessage = createOptimisticMessage(content, file, parentMessageId, currentChannelId);

    if (parentMessageId) {
      setThreadMessages(prev => [...prev, optimisticMessage]);
    } else {
      setMessages(prev => [...prev, optimisticMessage]);
    }

    try {
      await messageApi.createMessage(
        currentChannelId,
        content,
        file,
        onProgress,
        parentMessageId
      );
    } catch (err) {
      if (parentMessageId) {
        setThreadMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      }
      throw err;
    }
  };
};
