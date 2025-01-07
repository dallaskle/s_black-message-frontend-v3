import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { Label } from '../ui/label';
import { workspaceApi } from '../../api/workspace';
import { useToast } from '../ui/use-toast';
import { CreateWorkspace } from './CreateWorkspace';

const AddWorkspaceModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [workspaceUrl, setWorkspaceUrl] = useState('');
  const [isUrlManuallyEdited, setIsUrlManuallyEdited] = useState(false);
  const { toast } = useToast();

  // Auto-generate URL from name if not manually edited
  useEffect(() => {
    if (!isUrlManuallyEdited) {
      setWorkspaceUrl(name.toLowerCase().replace(/\s+/g, '-'));
    }
  }, [name, isUrlManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await workspaceApi.createWorkspace({
        name,
        workspace_url: workspaceUrl,
      });
      toast({
        title: "Success",
        description: "Workspace created successfully",
      });
      setIsOpen(false);
      setName('');
      setWorkspaceUrl('');
      setIsUrlManuallyEdited(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <CreateWorkspace onClick={() => setIsOpen(true)} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  setIsUrlManuallyEdited(true);
                  setWorkspaceUrl(e.target.value);
                }}
                placeholder="Enter workspace URL"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Workspace
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddWorkspaceModal;