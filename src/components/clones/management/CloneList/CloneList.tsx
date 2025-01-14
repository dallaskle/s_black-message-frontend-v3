import React, { useEffect, useCallback, useRef } from 'react';
import { useClone } from '../../../../contexts/Clone/CloneContext';
import { useWorkspace } from '../../../../contexts/WorkspaceContext';
import { Button } from '../../../ui/Button';
import { Skeleton } from '../../../ui/skeleton';
import { CloneCard } from './CloneCard';
import { CreateCloneModal } from '../CreateClone/CreateCloneModal';
import cloneApi from '../../../../api/clone';

export const CloneList: React.FC = React.memo(() => {
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const { state, actions } = useClone();
    const { currentWorkspace } = useWorkspace();
    const timeoutRef = useRef<NodeJS.Timeout>();
    const isMountedRef = useRef(true);

    const loadClones = useCallback(async () => {
        if (!currentWorkspace?.id) return;
        
        try {
            const response = await cloneApi.listClones(currentWorkspace.id);
            if (isMountedRef.current) {
                actions.setClones(response.data);
            }
        } catch (error) {
            console.error('Failed to load clones:', error);
        }
    }, [currentWorkspace?.id, actions]);

    useEffect(() => {
        isMountedRef.current = true;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                loadClones();
            }
        }, 1000);

        return () => {
            isMountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentWorkspace?.id]);

    if (state.isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Clones</h2>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    Create Clone
                </Button>
            </div>

            {state.clones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No clones available. Create one to get started!
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {state.clones.map((clone) => (
                        <CloneCard
                            key={clone.id}
                            clone={clone}
                            onSelect={() => actions.selectClone(clone)}
                        />
                    ))}
                </div>
            )}

            <CreateCloneModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}); 