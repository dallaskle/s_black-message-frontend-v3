import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import { workspaceApi } from '../../api/workspace';
import { CreateWorkspace } from './CreateWorkspace';
import Spinner from '../ui/Spinner';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const AddWorkspaceModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [workspaceUrl, setWorkspaceUrl] = useState('-workspace.s_black.com');
  const [isUrlManuallyEdited, setIsUrlManuallyEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { refreshWorkspaces, setCurrentWorkspaceByUrl } = useWorkspace();

  // Auto-generate URL from name if not manually edited
  useEffect(() => {
    if (!isUrlManuallyEdited) {
      setWorkspaceUrl(`${name.toLowerCase().replace(/[^\w-]+/g, '-')}-workspace.s_black.com`);
    }
  }, [name, isUrlManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // First create the workspace
      await workspaceApi.createWorkspace({
        name,
        workspace_url: workspaceUrl,
      });
      
      // Then update the workspaces list and set current workspace
      await refreshWorkspaces();
      setCurrentWorkspaceByUrl(workspaceUrl);
      
      // Finally show success state
      //setIsLoading(false);
      setIsSuccess(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create workspace');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setWorkspaceUrl('-workspace.s_black.com');
    setIsUrlManuallyEdited(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
      resetForm();
      setError(null);
      setIsSuccess(false);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <CreateWorkspace onClick={() => setIsOpen(true)} />
      </div>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!isLoading) {
          handleClose();
        }
      }}>
        <DialogContent className="sm:max-w-[425px] bg-background-primary">
          <DialogHeader>
            <DialogTitle>
              {isSuccess ? 'Workspace Created!' : 'Create New Workspace'}
            </DialogTitle>
          </DialogHeader>
          {isSuccess ? (
            <div className="space-y-4">
              <p className="text-center">Congratulations! Your workspace has been created successfully.</p>
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
                <Label htmlFor="url">Workspace URL</Label>
                <Input
                  id="url"
                  value={workspaceUrl}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setIsUrlManuallyEdited(true);
                    // Ensure the URL ends with .s_black.com
                    if (!inputValue.endsWith('.s_black.com')) {
                      setWorkspaceUrl(`${inputValue.replace(/\.s_black\.com$/, '')}.s_black.com`);
                    } else {
                      setWorkspaceUrl(inputValue);
                    }
                  }}
                  placeholder="Enter workspace URL"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner inline size={16} /> : 'Create Workspace'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddWorkspaceModal;