import { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Button } from '../../components/ui/Button';
import InviteMemberModal from '../../components/workspace/InviteMemberModal';
import InviteList from '../../components/workspace/InviteList';

const WorkspaceSettingsPage = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No workspace selected</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-8">
        {/* Workspace Info Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Workspace Settings</h2>
          <div className="bg-background-secondary p-6 rounded-lg space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Workspace Name</h3>
              <p className="text-gray-600">{currentWorkspace.name}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Workspace URL</h3>
              <p className="text-gray-600">{currentWorkspace.workspace_url}</p>
            </div>
          </div>
        </section>

        {/* Members Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Members</h2>
            <Button onClick={() => setShowInviteModal(true)}>
              Invite Member
            </Button>
          </div>
          
          {/* Invite List */}
          <InviteList />
        </section>
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onOpenChange={setShowInviteModal}
      />
    </div>
  );
};

export default WorkspaceSettingsPage; 