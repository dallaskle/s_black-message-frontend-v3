import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../ui/dialog';
import { CreateCloneForm } from './CreateCloneForm';

interface CreateCloneModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateCloneModal: React.FC<CreateCloneModalProps> = ({
    isOpen,
    onClose,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Clone</DialogTitle>
                </DialogHeader>
                <CreateCloneForm
                    onSuccess={onClose}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}; 