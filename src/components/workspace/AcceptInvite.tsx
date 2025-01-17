import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { workspaceInviteApi } from '../../api/workspaceInvite';
import { Button } from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { saveInviteUrl, getInviteUrl } from '../../utils/inviteStorage';

const AcceptInvite = () => {
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const { workspaceId, token } = useParams<{ workspaceId: string; token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('🔄 AcceptInvite mounted/updated', {
      isAuthenticated,
      workspaceId,
      token,
      pathname: location.pathname,
      existingInviteUrl: getInviteUrl()
    });

    if (!isAuthenticated) {
      console.log('👤 User not authenticated, preparing to save invite URL');
      
      // Get the full invite URL
      const inviteUrl = location.pathname;
      console.log('🔗 Current location:', {
        pathname: location.pathname,
        fullUrl: window.location.href,
        inviteUrl
      });

      try {
        saveInviteUrl(inviteUrl);
        const savedUrl = getInviteUrl(); // Verify it was saved
        console.log('✅ Invite URL saved and verified:', savedUrl);
      } catch (error) {
        console.error('❌ Error saving invite URL:', error);
      }

      console.log('🚀 Redirecting to login page');
      navigate(`/login`);
    } else {
      console.log('👤 User is authenticated, ready to accept invite', { userId: user?.id });
    }
  }, [isAuthenticated, navigate, location, workspaceId, token, user]);

  const handleAcceptInvite = async () => {
    if (!workspaceId || !token || !user) {
      console.log('❌ Missing required data:', { workspaceId, token, userId: user?.id });
      return;
    }

    console.log('🤝 Attempting to accept invite:', { workspaceId, token });
    setIsAccepting(true);
    setError(null);

    try {
      await workspaceInviteApi.acceptInvite(workspaceId, token);
      console.log('✅ Successfully accepted invite');
      navigate(`/`);
    } catch (error: any) {
      console.error('❌ Failed to accept invite:', error);
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