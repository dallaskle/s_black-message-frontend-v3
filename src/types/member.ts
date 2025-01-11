export interface MemberWithUser {
  id: string;
  role: 'admin' | 'member';
  user_id: string;
  users: {
    id: string;
    name: string;
    email: string;
  };
  joined_at: string;
}

export interface MemberListResponse {
  data: MemberWithUser[];
  error: string | null;
}

export interface MemberContextType {
  workspaceMembers: Record<string, MemberWithUser[]>;
  channelMembers: Record<string, MemberWithUser[]>;
  loadingWorkspaceMembers: boolean;
  loadingChannelMembers: boolean;
  error: string | null;
  fetchWorkspaceMembers: (workspaceId: string) => Promise<void>;
  fetchChannelMembers: (channelId: string) => Promise<void>;
  clearMembers: () => void;
} 