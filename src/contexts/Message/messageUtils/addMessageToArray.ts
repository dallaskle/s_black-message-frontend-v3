import { Message, MessageStatus } from "../../../types/message";

export const addMessageToArray = (messages: Message[], message: Message): Message[] => {
  if (message.parent_message_id) {
    return messages.map(msg => {
      if (msg.id === message.parent_message_id) {
        return {
          ...msg,
          replies: [...(msg.replies || []), message]
        };
      }
      return msg;
    });
  }
  
  return [...messages, message];
};

export const createOptimisticMessage = (content: string, file?: File, parentMessageId?: string, 
                                        currentChannelId?: string): Message => ({
    id: `temp-${Date.now()}`,
    content,
    channel_id: currentChannelId || '',
    parent_message_id: parentMessageId || null,
    created_at: new Date().toISOString(),
    updated_at: null,
    user_id: 'current-user',
    name: 'User',
    reactions: {},
    userReactions: [],
    files: file ? [{
      id: 'temp',
      file_url: URL.createObjectURL(file),
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    }] : [],
    status: MessageStatus.Active
  });
