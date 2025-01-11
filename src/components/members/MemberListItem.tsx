import React from 'react';
import { MemberWithUser } from '../../types/member';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';

interface MemberListItemProps {
  member: MemberWithUser;
  isOnline?: boolean;
}

export const MemberListItem: React.FC<MemberListItemProps> = ({ member, isOnline = false }) => {
  const { users, role } = member;
  const initials = users.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center justify-between p-2 hover:bg-background-primary rounded-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${users.name}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-state-success rounded-full border-2 border-background-secondary" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm text-text-primary">{users.name}</p>
          <p className="text-xs text-text-secondary">{users.email}</p>
        </div>
      </div>
      <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="text-xs">
        {role}
      </Badge>
    </div>
  );
}; 