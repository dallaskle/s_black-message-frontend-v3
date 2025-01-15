import { Channel } from "./channel";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  workspace_url: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'member';
  profile_picture_url: string | null;
  display_name: string | null;
  description: string | null;
  joined_at: string;
} 

export interface WorkspaceWithChannels extends Workspace {
  channels: Channel[];
}

export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  token: string;
  role: 'admin' | 'member';
  expires_at: string | null;
  single_use: boolean;
  created_by: string;
  created_at: string;
}