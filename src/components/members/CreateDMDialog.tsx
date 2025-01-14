import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus } from 'lucide-react';
import { MemberList } from './MemberList';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { MemberWithUser } from '../../types/member';
import { channelApi } from '../../api/channel';
import { Button } from '../ui/Button';

export const CreateDMDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<MemberWithUser[]>([]);
  const { currentWorkspace, setCurrentChannel, refreshCurrentWorkspaceChannels } = useWorkspace();

  const handleMemberSelect = (member: MemberWithUser) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(m => m.id === member.id);
      if (isSelected) {
        return prev.filter(m => m.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleCreateDM = async () => {
    if (!currentWorkspace || selectedMembers.length === 0) return;

    try {
      const targetUserIds = selectedMembers.map(member => member.users.id);
      let channel;
      
      if (targetUserIds.length === 1) {
        channel = await channelApi.createDM(currentWorkspace.id, targetUserIds[0]);
      } else {
        channel = await channelApi.createGroupDM(currentWorkspace.id, targetUserIds);
      }

      await refreshCurrentWorkspaceChannels();
      setCurrentChannel(channel);
      setIsOpen(false);
      setSearchQuery('');
      setSelectedMembers([]);
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
          <div className="space-y-4">
            <MemberList
              workspaceId={currentWorkspace.id}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onMemberSelect={handleMemberSelect}
              selectedMembers={selectedMembers}
              excludeCurrentUser
              showInviteButton={false}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleCreateDM}
                disabled={selectedMembers.length === 0}
              >
                Create Chat
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 