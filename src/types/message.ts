export interface Message {
  id: string;
  content: string;
  channel_id: string;
  parent_message_id?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  reactions: Record<string, number>;
  userReactions: string[];
  replies?: Message[];
} 