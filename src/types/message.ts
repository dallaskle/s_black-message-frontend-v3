import { FileData } from './file';

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  parent_message_id: string | null;
  created_at: string;
  updated_at: string | null;
  name: string;
  reactions: { [emoji: string]: number };
  userReactions: string[];
  files?: FileData[];
  replies?: Message[];
  status: MessageStatus;
} 

export enum MessageStatus {
  Deleted = 'deleted',
  Active = 'active',
  Edited = 'edited',
}