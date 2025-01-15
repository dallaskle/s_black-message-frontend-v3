import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workspaceInviteApi } from '../../api/workspaceInvite';
import { Button } from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const AcceptInvite = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const { workspaceId, token } = useParams<{ workspaceId: string; token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { refreshWorkspaces } = useWorkspace();

  useEffect(() => {
    if (!isAuthenticated) {
      // Save the invitation URL to redirect back after login
      const inviteUrl = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(inviteUrl)}`);
    }
  }, [isAuthenticated, navigate]);

  const handleAcceptInvite = async () => {
    if (!workspaceId || !token || !user) return;

    setIsAccepting(true);
    setError(null);

    try {
      await workspaceInviteApi.acceptInvite(workspaceId, token);
      await refreshWorkspaces();
      navigate(`/`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to accept invitation');
      setIsAccepting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="max-w-md w-full p-6 bg-background-secondary rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Workspace Invitation
        </h1>
        
        {error ? (
          <div className="text-center space-y-4">
            <div className="text-red-500 p-3 bg-red-50 rounded">
              {error}
            </div>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center">
              You've been invited to join a workspace.
              <br />
              Click below to accept the invitation.
            </p>
            
            <div className="flex justify-center">
              <Button
                onClick={handleAcceptInvite}
                disabled={isAccepting}
                className="w-full"
              >
                {isAccepting ? <Spinner inline size={16} /> : 'Accept Invitation'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite; 