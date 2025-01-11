import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import { channelApi } from '../../api/channel';
import Spinner from '../ui/Spinner';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Channel } from '../../types/channel';

interface AddDMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDMCreated?: (channel: Channel) => Promise<void>;
}

const AddDMModal = ({ isOpen, onClose, onDMCreated }: AddDMModalProps) => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const newChannel = await channelApi.createDM(currentWorkspace.id, userId.trim());
      if (onDMCreated) {
        await onDMCreated(newChannel);
      } else {
        await refreshWorkspaces();
      }
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create DM');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setUserId('');
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-background-primary">
        <DialogHeader>
          <DialogTitle>Start Direct Message</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner inline size={16} /> : 'Start DM'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDMModal; 