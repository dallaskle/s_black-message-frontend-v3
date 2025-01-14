import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workspaceInviteApi } from '../../api/workspaceInvite';
import { Button } from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const AcceptInvitePage = () => {
  const { workspaceId, token } = useParams<{ workspaceId: string; token: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshWorkspaces } = useWorkspace();

  useEffect(() => {
    const acceptInvite = async () => {
      if (!workspaceId || !token) {
        setError('Invalid invitation link');
        setIsLoading(false);
        return;
      }

      try {
        await workspaceInviteApi.acceptInvite(workspaceId, token);
        await refreshWorkspaces();
        // Navigate to the workspace
        navigate(`/workspace/${workspaceId}`);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to accept invitation');
        setIsLoading(false);
      }
    };

    acceptInvite();
  }, [workspaceId, token]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Spinner size={32} />
        <p>Accepting invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Error</p>
          <p>{error}</p>
        </div>
        <Button onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </div>
    );
  }

  return null;
};

export default AcceptInvitePage; 