import { MemberWithUser, MemberListResponse } from '../types/member';

export const getWorkspaceMembers = async (workspaceId: string): Promise<MemberListResponse> => {
  try {
    const response = await fetch(`/workspaces/${workspaceId}/members/list`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch workspace members');
    }

    const data: MemberWithUser[] = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch workspace members',
    };
  }
};

export const getChannelMembers = async (channelId: string): Promise<MemberListResponse> => {
  try {
    const response = await fetch(`/channels/${channelId}/members/list`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch channel members');
    }

    const data: MemberWithUser[] = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch channel members',
    };
  }
}; 