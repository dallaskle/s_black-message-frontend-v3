import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface CreateWorkspaceProps {
  onClick: () => void;
}

export const CreateWorkspace = ({ onClick }: CreateWorkspaceProps) => {
  return (
    <Button 
      onClick={onClick}
      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Plus className="h-5 w-5" />
      <span className="sr-only">Add Workspace</span>
    </Button>
  );
};
