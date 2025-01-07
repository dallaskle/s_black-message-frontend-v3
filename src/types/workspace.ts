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