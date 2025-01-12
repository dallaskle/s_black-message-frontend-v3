import { useEffect, useState } from 'react';
import { workspaceInviteApi, WorkspaceInvitation } from '../../api/workspaceInvite';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Button } from '../ui/Button';
import Spinner from '../ui/Spinner';
import { formatDistanceToNow } from 'date-fns';

const InviteList = () => {
  const [invites, setInvites] = useState<WorkspaceInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  const loadInvites = async () => {
    if (!currentWorkspace) return;
    
    try {
      const data = await workspaceInviteApi.getInvites(currentWorkspace.id);
      setInvites(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, [currentWorkspace]);

  const handleRevoke = async (invitationId: string) => {
    if (!currentWorkspace) return;
    
    try {
      await workspaceInviteApi.revokeInvite(currentWorkspace.id, invitationId);
      // Refresh the list
      loadInvites();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to revoke invitation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
        {error}
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No pending invitations
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pending Invitations</h3>
      <div className="space-y-2">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
          >
            <div className="space-y-1">
              <div className="font-medium">{invite.email}</div>
              <div className="text-sm text-gray-500">
                Role: {invite.role}
                {' • '}
                Sent {formatDistanceToNow(new Date(invite.created_at))} ago
                {invite.expires_at && (
                  <>
                    {' • '}
                    Expires {formatDistanceToNow(new Date(invite.expires_at))}
                  </>
                )}
              </div>
            </div>
            <Button
              onClick={() => handleRevoke(invite.id)}
              variant="destructive"
              size="sm"
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteList; 