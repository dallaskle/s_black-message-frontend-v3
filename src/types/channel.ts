export type ChannelType = 'channel' | 'dm';
export type ChannelRole = 'admin' | 'moderator' | 'member';

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  is_private: boolean;
  type: ChannelType;
  topic: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: ChannelRole;
  joined_at: string;
} 