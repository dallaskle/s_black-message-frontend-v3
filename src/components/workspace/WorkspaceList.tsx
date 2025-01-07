import { useWorkspace } from '../../contexts/WorkspaceContext';

export function WorkspaceList() {
  const { workspaces, currentWorkspace, setCurrentWorkspace, isLoading, error } = useWorkspace();

  if (isLoading) {
    return (
      <div className="p-4 text-text-secondary">
        Loading workspaces...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-accent-error">
        {error}
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="p-4 text-text-secondary">
        No workspaces found. Create your first workspace to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2 className="px-4 text-sm font-semibold text-text-secondary uppercase">
        Workspaces
      </h2>
      <ul className="space-y-1">
        {workspaces.map((workspace) => (
          <li key={workspace.id}>
            <button
              onClick={() => setCurrentWorkspace(workspace)}
              className={`w-full px-4 py-2 text-left transition-colors ${
                currentWorkspace?.id === workspace.id
                  ? 'bg-accent-primary/10 text-text-primary'
                  : 'text-text-secondary hover:bg-background-secondary'
              }`}
            >
              {workspace.name}
              {workspace.workspace_url && 
                <div className="text-xs text-text-secondary">
                    {workspace.workspace_url}
                </div>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 