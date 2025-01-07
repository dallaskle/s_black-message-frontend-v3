import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface CreateWorkspaceProps {
  onClick: () => void;
}

export const CreateWorkspace: React.FC<CreateWorkspaceProps> = ({ onClick }) => (
  <Button 
    onClick={onClick}
    className="rounded-full bg-charcoal-gray hover:bg-gray-100 hover:text-black outline outline-1 outline-gray-400 dark:hover:bg-gray-800 mt-2"
  >
    <Plus className="text-gray-400 h-5 w-5 inline hover:text-black" />
    <span className="text-gray-400 text-sm ml-1 inline hover:text-black">Add Workspace</span>
  </Button>
);
