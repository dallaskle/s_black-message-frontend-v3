import { Message } from "../../../types/message";

export const doesMessageExist = (array: Message[], message: Message): boolean =>
    array.some(m => m.id === message.id || (m.id.startsWith('temp-') && m.content === message.content));