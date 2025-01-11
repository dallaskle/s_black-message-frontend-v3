import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import Spinner from '../ui/Spinner';

interface DeleteChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  channelName: string;
}

const DeleteChannelModal = ({ isOpen, onClose, onConfirm, channelName }: DeleteChannelModalProps) => {
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmName !== channelName) {
      setError(`Channel name must match exactly: "${channelName}"`);
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await onConfirm();
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete channel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setConfirmName('');
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-background-primary">
        <DialogHeader>
          <DialogTitle className="text-red-500">Delete Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              This action cannot be undone. Please type <span className="font-mono bg-background-secondary px-1 py-0.5 rounded">{channelName}</span> to confirm deletion.
            </p>
            <Label htmlFor="confirmName">Channel Name</Label>
            <Input
              id="confirmName"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={channelName}
              required
              autoComplete="off"
              className="font-mono"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || confirmName !== channelName}
              className="bg-red-500 hover:bg-red-600 text-white disabled:bg-red-300"
            >
              {isLoading ? <Spinner inline size={16} /> : 'Delete Channel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChannelModal; 