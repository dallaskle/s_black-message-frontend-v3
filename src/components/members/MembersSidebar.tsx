import React, { useState } from 'react';
import { MemberList } from './MemberList';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

interface MembersSidebarProps {
  workspaceId?: string;
  channelId?: string;
  onClose: () => void;
  className?: string;
}

export const MembersSidebar: React.FC<MembersSidebarProps> = ({
  workspaceId,
  channelId,
  onClose,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={`w-80 border-l border-border-primary bg-background-secondary h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-border-primary">
        <h2 className="font-semibold text-text-primary">Members</h2>
        <Button variant="secondary" onClick={onClose} className="p-2">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <MemberList
        workspaceId={workspaceId}
        channelId={channelId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}; 