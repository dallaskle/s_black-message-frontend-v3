import { useEffect, useState } from 'react';
import { WorkspaceInvitation } from '../../types/workspace';
import { workspaceInviteApi } from '../../api/workspaceInvite';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Button } from '../ui/Button';
import Spinner from '../ui/Spinner';
import { format } from 'date-fns';

const InviteList = () => {
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  const fetchInvitations = async () => {
    if (!currentWorkspace) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await workspaceInviteApi.getInvitations(currentWorkspace.id);
      setInvitations(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch invitations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [currentWorkspace?.id]);

  const handleRevoke = async (invitationId: string) => {
    if (!currentWorkspace) return;
    
    try {
      await workspaceInviteApi.revokeInvite(currentWorkspace.id, invitationId);
      setInvitations(invitations.filter(invite => invite.id !== invitationId));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to revoke invitation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        No pending invitations
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pending Invitations</h3>
      <div className="divide-y">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{invitation.email}</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>Role: {invitation.role}</p>
                <p>Sent: {format(new Date(invitation.created_at), 'MMM d, yyyy')}</p>
                {invitation.expires_at && (
                  <p>
                    Expires: {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                  </p>
                )}
                {invitation.single_use && <p>Single-use invitation</p>}
              </div>
            </div>
            <Button
              onClick={() => handleRevoke(invitation.id)}
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