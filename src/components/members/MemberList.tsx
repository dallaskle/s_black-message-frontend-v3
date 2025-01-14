import React, { useEffect, useState } from 'react';
import { MemberListItem } from './MemberListItem';
import { useMemberContext } from '../../contexts/Member/MemberContext';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { MemberWithUser } from '../../types/member';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { UserPlus } from 'lucide-react';
import InviteMemberModal from '../workspace/InviteMemberModal';

interface MemberListProps {
  workspaceId?: string;
  channelId?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onMemberSelect?: (member: MemberWithUser) => void;
  selectedMembers?: MemberWithUser[];
  excludeCurrentUser?: boolean;
  showInviteButton?: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({
  workspaceId,
  channelId,
  searchQuery = '',
  onSearchChange,
  onMemberSelect,
  selectedMembers = [],
  excludeCurrentUser = false,
  showInviteButton = true
}) => {
  const [showInvite, setShowInvite] = useState(false);
  const {
    workspaceMembers,
    channelMembers,
    loadingWorkspaceMembers,
    loadingChannelMembers,
    error,
    fetchWorkspaceMembers,
    fetchChannelMembers
  } = useMemberContext();
  const { user } = useAuth();

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

  const filteredMembers = members
    .filter(member => 
      (!excludeCurrentUser || member.users.id !== user?.id) &&
      (member.users.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.users.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
      <div className="flex items-center gap-2">
        {onSearchChange && (
          <Input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-background-primary text-text-primary placeholder:text-text-secondary"
          />
        )}
        {workspaceId && showInviteButton && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        )}
      </div>
      
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
              isSelected={selectedMembers.some(m => m.id === member.id)}
              className={onMemberSelect ? 'cursor-pointer hover:bg-accent/10' : ''}
            />
          ))
        ) : (
          <div className="text-center text-text-secondary py-4">
            No members found
          </div>
        )}
      </div>

      <InviteMemberModal
        isOpen={showInvite}
        onOpenChange={setShowInvite}
      />
    </div>
  );
}; 