import React from 'react';
import { MemberWithUser } from '../../types/member';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface MemberListItemProps {
  member: MemberWithUser;
  isOnline?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MemberListItem: React.FC<MemberListItemProps> = ({ 
  member, 
  isOnline = false,
  onClick,
  className
}) => {
  const { users, role } = member;
  const initials = users.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-2 hover:bg-background-primary rounded-md",
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
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