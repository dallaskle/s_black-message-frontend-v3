import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Spinner from '../ui/Spinner';
import { workspaceApi } from '../../api/workspace';
import type { WorkspaceWithChannels } from '../../types/workspace';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkspaceSettingsModal = ({ isOpen, onOpenChange }: WorkspaceSettingsModalProps) => {
  const { currentWorkspace, updateWorkspace } = useWorkspace();
  const [name, setName] = useState(currentWorkspace?.name || '');
  const [workspaceUrl, setWorkspaceUrl] = useState(currentWorkspace?.workspace_url || '');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const updatedWorkspaceData = await workspaceApi.updateWorkspace(currentWorkspace.id, {
        name,
        workspace_url: workspaceUrl,
      });
      
      // Merge the updated data with existing channels
      const updatedWorkspace: WorkspaceWithChannels = {
        ...updatedWorkspaceData,
        channels: currentWorkspace.channels,
      };
      
      updateWorkspace(updatedWorkspace);
      setIsSuccess(true);
      setIsLoading(false);
      
      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update workspace settings');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setError(null);
      setIsSuccess(false);
      // Reset form to current workspace values
      if (currentWorkspace) {
        setName(currentWorkspace.name);
        setWorkspaceUrl(currentWorkspace.workspace_url);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-background-primary">
        <DialogHeader>
          <DialogTitle>
            {isSuccess ? 'Settings Updated!' : 'Workspace Settings'}
          </DialogTitle>
        </DialogHeader>
        {isSuccess ? (
          <div className="space-y-4">
            <p className="text-center">Workspace settings have been updated successfully.</p>
            <div className="flex justify-center">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspaceUrl">Workspace URL</Label>
              <Input
                id="workspaceUrl"
                value={workspaceUrl}
                onChange={(e) => setWorkspaceUrl(e.target.value)}
                placeholder="Enter workspace URL"
                required
              />
              <p className="text-sm text-gray-500">
                This URL will be used for workspace access and sharing
              </p>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Danger Zone</h4>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  // TODO: Implement delete workspace functionality
                  alert('Delete workspace functionality to be implemented');
                }}
              >
                Delete Workspace
              </Button>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner inline size={16} /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceSettingsModal; 