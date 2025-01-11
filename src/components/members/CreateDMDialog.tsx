import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';
import { MemberList } from './MemberList';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { MemberWithUser } from '../../types/member';
import { channelApi } from '../../api/channel';

export const CreateDMDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentWorkspace, setCurrentChannel } = useWorkspace();

  const handleMemberSelect = async (member: MemberWithUser) => {
    if (!currentWorkspace) return;

    try {
      const channel = await channelApi.createDM(currentWorkspace.id, member.users.id);
      setCurrentChannel(channel);
      setIsOpen(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to create DM channel:', error);
      // TODO: Add error handling UI
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="text-text-secondary hover:text-text-primary"
          aria-label="Add Direct Message"
        >
          <Plus className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
        </DialogHeader>
        {currentWorkspace && (
          <MemberList
            workspaceId={currentWorkspace.id}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onMemberSelect={handleMemberSelect}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}; 