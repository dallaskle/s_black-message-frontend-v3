import { Message } from "../../../types/message";

export const updateMessageArray = (array: Message[], message: Message) =>
    array.map(m =>
      m.id === message.id || (m.id.startsWith('temp-') && m.content === message.content)
        ? { ...message, name: message.name || m.name }
        : m
    );