import React, { useEffect } from 'react';
import { MemberListItem } from './MemberListItem';
import { useMemberContext } from '../../contexts/Member/MemberContext';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { MemberWithUser } from '../../types/member';

interface MemberListProps {
  workspaceId?: string;
  channelId?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onMemberSelect?: (member: MemberWithUser) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  workspaceId,
  channelId,
  searchQuery = '',
  onSearchChange,
  onMemberSelect
}) => {
  const {
    workspaceMembers,
    channelMembers,
    loadingWorkspaceMembers,
    loadingChannelMembers,
    error,
    fetchWorkspaceMembers,
    fetchChannelMembers
  } = useMemberContext();

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceMembers(workspaceId);
    }
  }, [workspaceId, fetchWorkspaceMembers]);

  useEffect(() => {
    if (channelId) {
      fetchChannelMembers(channelId);
    }
  }, [channelId, fetchChannelMembers]);

  const members = channelId
    ? channelMembers[channelId] ?? []
    : workspaceId
    ? workspaceMembers[workspaceId] ?? []
    : [];

  const filteredMembers = members.filter(member =>
    member.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.users.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loading = channelId ? loadingChannelMembers : loadingWorkspaceMembers;

  if (error) {
    return (
      <div className="p-4 text-accent-error text-sm">
        Error loading members: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {onSearchChange && (
        <Input
          type="text"
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-background-primary text-text-primary placeholder:text-text-secondary"
        />
      )}
      
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <MemberListItem
              key={member.id}
              member={member}
              isOnline={false}
              onClick={onMemberSelect ? () => onMemberSelect(member) : undefined}
              className={onMemberSelect ? 'cursor-pointer hover:bg-accent/10' : ''}
            />
          ))
        ) : (
          <div className="text-center text-text-secondary py-4">
            No members found
          </div>
        )}
      </div>
    </div>
  );
}; 