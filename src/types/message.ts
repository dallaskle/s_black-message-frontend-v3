export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  parent_message_id: string | null;
  created_at: string;
  updated_at: string | null;
  name: string;
  reactions: {
    [emoji: string]: number;  // Emoji to count mapping
  };
  userReactions: string[];   // List of emojis the current user has reacted with
} 