import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/input';
import { useClone } from '../../../../contexts/Clone/CloneContext';
import { useWorkspace } from '../../../../contexts/WorkspaceContext';
import { useToast } from '../../../ui/use-toast';
import { CreateCloneData, CloneVisibility } from '../../../../types/clone';

const createCloneSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().optional(),
    base_prompt: z.string().min(1, 'Base prompt is required'),
    visibility: z.enum(['global', 'private'] as const),
});

type CreateCloneFormData = z.infer<typeof createCloneSchema>;

export const CreateCloneForm: React.FC<{
    onSuccess?: () => void;
    onCancel?: () => void;
}> = ({ onSuccess, onCancel }) => {
    const { actions } = useClone();
    const { currentWorkspace } = useWorkspace();
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CreateCloneFormData>({
        resolver: zodResolver(createCloneSchema),
        defaultValues: {
            visibility: 'private' as CloneVisibility,
        },
    });

    const onSubmit = async (data: CreateCloneFormData) => {
        try {
            const cloneData: CreateCloneData = {
                ...data,
                workspace_id: currentWorkspace?.id,
            };

            await actions.createClone(cloneData);
            toast({
                title: 'Success',
                description: 'Clone created successfully',
            });
            onSuccess?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create clone',
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Input
                    {...register('name')}
                    placeholder="Clone Name"
                    className="w-full"
                />
                {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
            </div>

            <div>
                <Input
                    {...register('description')}
                    placeholder="Description (optional)"
                    className="w-full"
                />
            </div>

            <div>
                <textarea
                    {...register('base_prompt')}
                    placeholder="Base Prompt (e.g., You are an expert in...)"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                />
                {errors.base_prompt && (
                    <p className="text-sm text-red-500 mt-1">
                        {errors.base_prompt.message}
                    </p>
                )}
            </div>

            <div>
                <select
                    {...register('visibility')}
                    className="w-full p-2 border rounded-md"
                >
                    <option value="private">Private (Workspace Only)</option>
                    <option value="global">Global (All Workspaces)</option>
                </select>
            </div>

            <div className="flex justify-end space-x-2">
                {onCancel && (
                    <Button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Clone'}
                </Button>
            </div>
        </form>
    );
}; 